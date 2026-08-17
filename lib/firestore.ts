// ⭐️ここは実際にfirestoreで扱うデータの処理を書くところ
import type { Company } from "@/types/company";
// collection:どこにデータがあるかを示すオブジェクト
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 引数の名前が uid、その型が string。「この関数は文字列を1つ受け取る」
// Promiseは今はないがあとで入る箱。<Company[]>で中身をCompanyに決めてる。型を決めることにより返し忘れ、返し間違いを防止
// →asyncは毎回Promiseという戻り値を返す、今までは戻り値がなかったから書かなかった。
export async function getCompanies(uid: string): Promise<Company[]> {
  // db:どのデータベースか、"user":コレクション、uid:ドキュメント(ログインしてる人の識別子、useAuth()から受け取ったuserから抜き出してる)、companies:コレクション
  const companiesRef = collection(db, "users", uid, "companies");
  // query():どこから(companiesRef)、取ってくる時の条件(orderBy()):今回なら応募日が降順になる順番でcompaniesRefから返ってくるデータを取ってくる
  const companiesQuery = query(companiesRef, orderBy("appliedAt", "desc"));
  // getDocsは実際にデータを取ってくる命令
  const snapshot = await getDocs(companiesQuery);
  // FirebaseではsnapshotでとってきたドキュメントはIDと中身が別々になっている。だから、IDを取り出すには(doc.id)、中身を取り出すには関数を呼ぶ(doc.data())必要がある
  // 下ではmapでこのIDと中身を合体させて一つのオブジェクトにして、そのまとまりを配列で返す→それをPromise<Company[]>で設定した戻り値の中に入れる、
  // docs:snapshotが持つプロパティ,Firebaseが決めてる、doc:自分で決めた変数名
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    // ...のスプレット構文でdoc.dataを展開しながら、as Omit<Company, "id">によってこの中身はCompanyの型からIDを除いたものだよと宣言している
    // as:後ろのConpanyからIDを除いた型で前のデータを判定しろという宣言。検査をするわけじゃない
    ...(doc.data() as Omit<Company, "id">),
  }));
}

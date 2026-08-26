// ⭐️ここは実際にfirestoreで扱うデータの処理を書くところ
import type { Company, CompanyInput } from "@/types/company";
// collection:どこにデータがあるかを示すオブジェクト
import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
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
    // ...のスプレット構文でdoc.dataを展開。
    // as:後ろのCompanyからIDを除いた型で前のデータを判定しろという宣言。検査をするわけじゃない
    ...(doc.data() as CompanyInput),
  }));
}
// 引数にユーザーの識別子とIDがまだない状態のデータが使われる。→IDは中身ではなく、置き場所
export async function addCompany(uid: string, data: CompanyInput): Promise<void> {
  const companiesRef = collection(db, "users", uid, "companies");
  // queryもorderByもいらない。なぜなら、データを置きにいくだけだから。
  // addDocは新しいドキュメントの参照を返す。つまり、データを保存しにいく際に自動で決められるドキュメントのIDを関数の返り値として返すということ。しかし、設計上データの登録後は一覧ページに飛ぶため、それがいらない。使わないため上のPromise<void>でこの関数は何も返さないと明示的に示した。
  await addDoc(companiesRef, data);
}

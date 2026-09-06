// ⭐️ここは実際にfirestoreで扱うデータの処理を書くところ
import type { Company, CompanyInput, CompanyStatus } from "@/types/company";
// collection():どこにデータがあるかを示す関数（複数を指定）→getDocsを使う
// doc():どこにデータがあるかを示す関数(一つを指定)→getDocを使う
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 引数の名前が uid、その型が string。「この関数は文字列を1つ受け取る」
// Promiseは今はないがあとで中身(今回の場合ならCompany[])が入る箱。<Company[]>で中身をCompanyに決めてる。<>は型に別の型を渡すための記法。Promiseは「何かを包む箱」なので中身の指定がいる。ここでは、型を決めることにより返し忘れ、返し間違いを防止
// →asyncは毎回Promiseという戻り値を返す、今までは戻り値がなかったから書かなかった。
export async function getCompanies(uid: string): Promise<Company[]> {
  // db:どのデータベースか、"users":コレクション、uid:ドキュメント(ログインしてる人の識別子、useAuth()から受け取ったuserから抜き出してる)、companies:コレクション
  const companiesRef = collection(db, "users", uid, "companies");
  // query():どこから(companiesRef)、取ってくる時の条件(orderBy()):今回なら応募日が降順になる順番でcompaniesRefから返ってくるデータを取ってくる
  const companiesQuery = query(companiesRef, orderBy("appliedAt", "desc"));
  // getDocsは実際にデータを取ってくる命令
  const snapshot = await getDocs(companiesQuery);
  // FirebaseではsnapshotでとってきたドキュメントはIDと中身が別々になっている。だから、IDを取り出すには(doc.id→プロパティ - そこに決まった値がある)、中身を取り出すには関数を呼ぶ(doc.data()→メソッド - 呼ぶと処理が走り毎回新しいオブジェクトが作られる→IDと違いFirestoreの内部形式をオブジェクトに組み立て直す必要がある)必要がある
  // 下ではmapでこのIDと中身を合体させて一つのオブジェクトにして、そのまとまりを配列で返す→それをPromise<Company[]>で設定した戻り値の中に入れる、
  // docs:snapshotが持つプロパティでFirebaseが決めてる、doc:自分で決めた変数名
  // snapshot.docs:　ドキュメントの配列を表す(一つ一つの企業のデータ(オブジェクト)とIDを持った入れ物を配列で持っているということ)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    // ...のスプレッド構文でdoc.data()を展開。
    // as:後ろのCompanyからIDを除いた型で前のデータを扱えという宣言。検査をするわけじゃない
    ...(doc.data() as CompanyInput),
  }));
}
// 引数にユーザーの識別子とIDがまだない状態のデータが使われる。→IDは中身ではなく、置き場所
export async function addCompany(uid: string, data: CompanyInput):
// voidは値を返さない関数ということを示す、つまりこの関数には返り値がないよと宣言。
Promise<void> {
  const companiesRef = collection(db, "users", uid, "companies");
  // queryもorderByもいらない。なぜなら、データを置きにいくだけだから。
  // addDocは新しいドキュメントの参照を返す。つまり、データを保存しにいく際に自動で決められるドキュメントのIDを関数の返り値として返すということ。しかし、設計上データの登録後は一覧ページに飛ぶため、それがいらない。使わないため上のPromise<void>でこの関数は何も返さないと明示的に示した。
  await addDoc(companiesRef, data);
}

export async function getCompany(uid: string, id: string): Promise<Company | null> {
  // companyRefでIDからなるドキュメントを指定する
  const companyRef = doc(db, "users", uid, "companies", id);
  // getDocでIDによって指定されたドキュメントからIDと企業データのオブジェクトが入れ物に入ったものを探しに行く。それがsnapshotに入る。
  // もし、自分の階層に存在しないID(URLに他人のIDを入れたとしても見に行くのは自分のuidの配下だからそもそも他人のIDも存在しないIDの中に入る)だった場合にはIDだけが入った入れ物を返す。下でexists()で文書(IDに対応したデータ)があるかを判定。
  const snapshot = await getDoc(companyRef);
  // exists()が返すのは真偽値
  // IDに対応した文書があるかを判定し、無ければ早期リターン
  if (!snapshot.exists()) return null;
  // IDとデータが別々で入れ物(snapshot)に入っているため合わせて返り値にする
  return {
    id: snapshot.id,
    ...(snapshot.data() as CompanyInput),
  };
}

export async function updateCompanyStatus(uid: string, id: string, status: CompanyStatus): Promise<void> {
  const companyRef = doc(db, "users", uid, "companies", id);
  // 更新関数は一部だけのデータを差し替えるupdateDocにする。setDcだと丸ごとデータを差し替えてしまう可能性があるし、setDoc(merge付き)は、文書が存在しないときに文書を勝手に作ってしまう。updateDocは文書がない場合にはエラーを出す。→この二つの関数からupdateDocを選んだことで「存在するものを作り変える」という意図が関数の選択に表れてる。
  // updateDocでは第二引数にどのフィールドのどの値を更新するかの指定が必要
  // {status}は省略記法でキー名と変数名が同じ場合は1回で済む。(本来なら{status: status})
  await updateDoc(companyRef, { status });
}

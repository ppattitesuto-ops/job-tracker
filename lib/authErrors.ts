// ⭐️Firebaseから受け取ったエラーに関する設定
// Firebaseの例外かを判定するためのコード
import { FirebaseError } from "firebase/app";
// エラーコードを安全に書くために用意された定数を集めたオブジェクト
import { AuthErrorCodes } from "firebase/auth";
// getAuthErrorMessage()の中にこの関数を別の場所で使う場合の引数を指定している→この場合ならエラーを受け取って型をunknownにして確認させるようにしてる。getAuthErrorMessage():stringとすることでこの関数の返り値は文字になるとしてしてる。
export function getAuthErrorMessage(error: unknown): string {

  // 実行時にこの値は本当にFirebaseErrorかどうかを判定
  // instanceofを通す前はerrorはunknownなのでerror.codeと書けない
  // それ以降のコードでerrorをFirebaseErrorとして扱えるようにする、判定した結果を型に反映させてる
  if (!(error instanceof FirebaseError)) {
    // Firebase以外のエラーはここで終わり
    return "ログインに失敗しました";
  }
  // Firebaseから渡ってきたコードに対する場合分け
  switch (error.code) {
    // AuthErrorCodesはオブジェクトだからキーを後に設定している
    case AuthErrorCodes.POPUP_CLOSED_BY_USER:
    case AuthErrorCodes.EXPIRED_POPUP_REQUEST:
      // ユーザーが自分で閉じただけなので、何も表示しない
      return "";
    case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
      return "メールアドレスまたはパスワードが正しくありません";
    case AuthErrorCodes.EMAIL_EXISTS:
      return "このメールアドレスはすでに登録されています";
    case AuthErrorCodes.WEAK_PASSWORD:
      return "パスワードは6文字以上で設定してください";
    case AuthErrorCodes.INVALID_EMAIL:
      return "メールアドレスの形式が正しくありません";
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return "試行回数が多すぎます。しばらく待ってからお試しください";
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return "通信に失敗しました。接続を確認してください";
    default:
      return "ログインに失敗しました";
  }
}

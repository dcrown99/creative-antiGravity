import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow

# 必要なスコープ（アップロード、管理、SSL強制）
SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload', 
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl'
]

def authenticate():
    # ディレクトリ構成の確認
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    creds_dir = os.path.join(base_dir, 'credentials')
    
    if not os.path.exists(creds_dir):
        os.makedirs(creds_dir)
        
    client_secrets_file = os.path.join(creds_dir, 'client_secrets.json')
    token_file = os.path.join(creds_dir, 'token.pickle')

    if not os.path.exists(client_secrets_file):
        print(f"Error: {client_secrets_file} が見つかりません。")
        print("Google Cloud Console から OAuth 2.0 クライアント ID の JSON をダウンロードし、")
        print("'client_secrets.json' という名前で credentials フォルダに配置してください。")
        return

    print("ブラウザを開いて認証を行います...")
    flow = InstalledAppFlow.from_client_secrets_file(client_secrets_file, SCOPES)
    creds = flow.run_local_server(port=0)

    # トークンを保存
    with open(token_file, 'wb') as token:
        pickle.dump(creds, token)
    
    print(f"\n✅ 認証成功！ トークンを保存しました: {token_file}")
    print("この 'token.pickle' をサーバーの同じディレクトリに配置してください。")

if __name__ == '__main__':
    authenticate()

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const provider = new GifViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("gifRotView", provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gif-rot.showView", () => {
      vscode.commands.executeCommand("workbench.view.explorer").then(() => {
        vscode.commands.executeCommand("workbench.view.extension.gifRotView");
      });
    })
  );
}

class GifViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    const webview = webviewView.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "media"),
      ],
    };

    const gifUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "hello-kitty.gif")
    );

    webview.html = `
      <html>
        <body style="margin:0; padding:0; background:transparent;">
          <img src="${gifUri}"
            style="
              width:100%;
              height:100%;
            "
          />
        </body>
      </html>
    `;
  }
}

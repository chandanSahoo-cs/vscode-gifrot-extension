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

  context.subscriptions.push(
    vscode.commands.registerCommand("gif-rot.addGifUrl", async () => {
      const url = await vscode.window.showInputBox({
        prompt: "Enter a GIF URL",
        placeHolder: "https://example.com/my.gif",
      });

      if (!url) return;

      await context.globalState.update("gifRot.currentGif", url);
      vscode.window.showInformationMessage("GIF updated!");

      // Refresh the webview
      vscode.commands.executeCommand("gifRotView.refresh");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gifRotView.refresh", () => {
      provider.refresh();
    })
  );

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("gifRot.gifUrl")) {
      provider.refresh();
    }
  });
}

class GifViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    const webview = webviewView.webview;
    webview.options = {
      enableScripts: true,
    };

    this.updateHtml();
  }

  public refresh() {
    this.updateHtml();
  }

  private updateHtml() {
    if (!this._view) return;

    const webview = this._view.webview;

    const userGif = vscode.workspace
      .getConfiguration("gifRot")
      .get<string>("gifUrl");

    const fallbackUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "giphy.gif")
    );

    const gifToShow =
      userGif && userGif.trim() !== "" ? userGif : fallbackUri.toString();

    webview.html = `
      <html>
        <body style="
          margin:0;
          padding:0;
          background:transparent;
          overflow:hidden;
          width:100%;
          height:100vh;
          display:flex;
          justify-content:center;
          align-items:center;
        ">
          <img src="${gifToShow}"
            style="
              width:100%;
              height:100%;
              object-fit:contain;
            "
          />
        </body>
      </html
  `;
  }
}

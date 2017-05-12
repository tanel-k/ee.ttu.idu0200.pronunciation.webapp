export class App {
  constructor() {}

  configureRouter(cfg, router) {
    this.router = router;
    cfg.title = 'Word.ly';

    cfg.map([
      {
        route: '',
        name: 'main',
        moduleId: 'containers/main-page/main-page'
      }
    ]);
  }
}

import VoyoApp from './app/app';
import VoyoStbAppOptions from './app/options';

document.addEventListener('DOMContentLoaded', () => {
    const app = new VoyoApp((<any>window).config as VoyoStbAppOptions);
    (<any>window).app = app;

    app.run();
});

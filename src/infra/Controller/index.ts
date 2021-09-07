import path from 'path';

export = (controllerUri: string) => {
    const controllerPath = path.resolve(`src/interface/http/modules/${controllerUri}`);
    const Controller = require(controllerPath);

    return Controller();
}
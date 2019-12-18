import { reject, resolve } from "q";

export interface ResourceInfo {
    url: string,
    type: 'text' | 'json',
    success?: (name: string, data: any, resource: ResourceInfo, loader: Loader)=>void
    failure?: (name: string, resource: ResourceInfo, loader: Loader)=>void
};

// This is helper class to fetch resources from the webserver
// Unlike C++, we can't block the main thread till files are read, so we use promises to notify the Game Class when the resources are ready
// This class is a work in progress so expect it to be enhanced in future labs
export default class Loader {
    resources: {[name: string]:any};
    promises: Promise<void>[];

    public constructor(){ 
        this.resources = {}
        this.promises = [];
    }

    public load(resources: {[name:string]:ResourceInfo}){
        for(let name in resources){
            let resource = resources[name];
            let promise = fetch(resource.url).then(
                response => {
                    if(resource.type === 'text') return response.text();
                    if(resource.type === 'json') return response.json();
                    reject(`Resource Type "${resource.type}" is unknown`);
                }
            ).then(
                data => {
                    this.resources[name]=data;
                    if(resource.success) resource.success(name, data, resource, this);
                }
            ).catch(
                reason => {
                    console.error(`Failed to load ${name}: ${reason}`);
                    if(resource.failure) resource.failure(name, resource, this);
                }
            )
            this.promises.push(promise)
        }
    }

    public unload(...resources: string[]){
        for(let name of resources){
            delete this.resources[name];
        }
    }

    public clear(){
        for(let name in this.resources){
            delete this.resources[name];
        }
    }

    public async wait(){
        while(this.promises.length > 0){
            const awaited = [...this.promises];
            this.promises.splice(0, this.promises.length);
            await Promise.all(awaited);
        }
    }
}
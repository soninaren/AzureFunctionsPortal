import { AiService } from '../shared/services/ai.service';
import { Component, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BusyStateComponent } from './../busy-state/busy-state.component';
import { RuntimeExtension } from '../shared/models/binding';
import { FunctionApp } from '../shared/function-app';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { FunctionsNode } from '../tree-view/functions-node';
import { FunctionInfo } from '../shared/models/function-info';
import { Observable } from 'rxjs/Observable';


@Component({
    selector: 'extension-install',
    templateUrl: './extension-install.component.html',
    styleUrls: ['./extension-install.component.scss'],
    inputs: ['viewInfoInput']
})
export class ExtensionInstallComponent {
    @Input() functionInfo: FunctionInfo;
    @Input() functionApp: FunctionApp;
    @Input() requiredExtensions: RuntimeExtension[];
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    packages: RuntimeExtension[];
    private functionsNode: FunctionsNode;
    private _viewInfoStream = new Subject<TreeViewInfo<any>>();
    public functionsInfo: FunctionInfo[];
    public jobLocations: any[] = [];

    constructor(private _aiService: AiService) {
        this._viewInfoStream
            .switchMap(viewInfo => {
                this.functionsNode = <FunctionsNode>viewInfo.node;
                this.functionApp = this.functionsNode.functionApp;
                return Observable.of('');
            })
            .do(null, e => {
                this._aiService.trackException(e, '/errors/extension-install');
                console.error(e);
            })
            .retry()
            .subscribe();
    }

    installRequiredExtensions() {
        this.setBusyState();
        if (this.requiredExtensions.length > 0) {
            const extensionCalls: Observable<any>[] = [];
            this.requiredExtensions.forEach(extension => {
                extensionCalls.push(this.functionApp.installExtension(extension));
            });

            // Check install status
            Observable.zip(...extensionCalls).subscribe((r) => {
                this.jobLocations = r;
                this.clearBusyState();
            });
        }
    }

    pollInstallationStatus() {
        setTimeout(() => {
            if (this.jobLocations.length > 0) {
                const status: Observable<any>[] = [];
                this.jobLocations.forEach(job => {
                    status.push(this.functionApp.getExtensionInstallStatus(job.id));
                });
                Observable.zip(...status).subscribe(r => {
                    let job: any[] = [];
                    r.forEach(jobStatus => {
                        if (jobStatus.status !== 'succeeded') {
                            job.push(jobStatus);
                        }
                    });
                    this.jobLocations = job;
                    if (this.jobLocations.length > 0) {
                        this.pollInstallationStatus();
                    }
                });
            }
        }, 500);
    }

    GetRequiredExtensions(templateExtensions: RuntimeExtension[]) {
        const extensions: RuntimeExtension[] = [];
        return this.functionApp.getHostExtensions().map(r => {
            // no extensions installed, all template extensions are required
            if (!r.extensions) {
                return templateExtensions;
            }

            templateExtensions.forEach(requiredExtension => {
                let isInstalled = false;
                r.extensions.forEach(installedExtension => {
                    isInstalled = isInstalled
                        || (requiredExtension.id === installedExtension.id
                            && requiredExtension.version === installedExtension.version);
                });

                if (!isInstalled) {
                    extensions.push(requiredExtension);
                }
            });

            return extensions;
        });
    }

    set viewInfoInput(viewInfoInput: TreeViewInfo<any>) {
        this._viewInfoStream.next(viewInfoInput);
    }

    setBusyState() {
        if (this.busyState) {
            this.busyState.setBusyState();
        }
    }

    clearBusyState() {
        if (this.busyState) {
            this.busyState.clearBusyState();
        }
    }
}

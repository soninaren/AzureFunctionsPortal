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
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    packages: RuntimeExtension[];
    requiredExtensions: RuntimeExtension[] = [];
    private functionsNode: FunctionsNode;
    private _viewInfoStream = new Subject<TreeViewInfo<any>>();
    public functionsInfo: FunctionInfo[];

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
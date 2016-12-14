import {Component, ViewChild, Input, OnChanges, SimpleChange} from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
//import {TopBarComponent} from './top-bar.component';
//import {FunctionEditComponent} from './function-edit.component';
//import {DropDownComponent} from './drop-down.component';
//import {AppMonitoringComponent} from './app-monitoring.component';
//import {AppSettingsComponent} from './app-settings.component';
//import {TrialExpiredComponent} from './trial-expired.component';
import {FunctionsService} from '../shared/services/functions.service';
import {UserService} from '../shared/services/user.service';
import {PortalService} from '../shared/services/portal.service';
import {FunctionInfo, FunctionInfoHelper} from '../shared/models/function-info';
import {VfsObject} from '../shared/models/vfs-object';
import {FunctionTemplate} from '../shared/models/function-template';
import {ScmInfo} from '../shared/models/scm-info';
import {Subscription} from '../shared/models/subscription';

import {Action} from '../shared/models/binding';
import {DropDownElement} from '../shared/models/drop-down-element';
import {ServerFarm} from '../shared/models/server-farm';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
//import {FunctionNewComponent} from './function-new.component';
//import {IntroComponent} from './intro.component';
//import {TutorialComponent} from './tutorial.component';
import {FunctionContainer} from '../shared/models/function-container';
import {ErrorEvent} from '../shared/models/error-event';
//import {SourceControlComponent} from './source-control.component';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {Cookie} from 'ng2-cookies/ng2-cookies';
//import {TryNowComponent} from './try-now.component';
import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {Response, ResponseType} from '@angular/http';
import {ArmService} from '../shared/services/arm.service';

@Component({
  selector: 'functions-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']  
})
export class DashboardComponent implements OnChanges {
    @ViewChild(SidebarComponent) sideBar: SidebarComponent;
    @Input() functionContainer: FunctionContainer;

    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public openAppMonitoring: boolean;
    public openAppSettings: boolean;
    public openSourceControl: boolean;
    public openIntro: any;
    public trialExpired: boolean;
    public action: Action;
    public tabId: string = "Develop";
    private disabled: boolean = false;

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _armService: ArmService) {

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            let selectedTabId: string;
            switch (event.step) {
                case TutorialStep.Develop:
                case TutorialStep.NextSteps:
                    selectedTabId = "Develop";
                    break;
                case TutorialStep.Integrate:
                    selectedTabId = "Integrate"
                    break;
                default:
                    break;
            }

            if (selectedTabId) {
                this.onChangeTab(selectedTabId);
            }
        });

        this._broadcastService.subscribe<any>(BroadcastEvent.FunctionNew, value => {
            this.action = <Action>value;

            var newFunc = this.functionsInfo.find((fi) => {
                return fi.name === this._translateService.instant('sideBar_newFunction');
            });
            this.selectedFunction = newFunc;
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) {
                delete this.selectedFunction;
            }
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionSelected, fi => {
            if (fi.config) {
                this.action = null;
            }
            this.resetView(false);
            this.sideBar.selectedFunction = fi;

            this._globalStateService.setBusyState();

            if (fi.name !== this._translateService.instant(PortalResources.sideBar_newFunction)) {
                this._functionsService.getFunction(fi).subscribe((fi) => {
                    this.selectedFunction = fi;
                    this._globalStateService.clearBusyState();
                });
            } else {
                this.selectedFunction = fi;
                this._globalStateService.clearBusyState();
            }

        });

        this._broadcastService.subscribe<void>(BroadcastEvent.TrialExpired, (event) => {
            this.trialExpired = true;
        });

        this._globalStateService.DashboardComponent = this;
    }

    // Handles the scenario where the FunctionInfo binding on the app.component has changed,
    // like for instance if we get a new resourceId from Ibiza.
    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (!this._globalStateService.GlobalDisabled) {
            this.initFunctions();
        }
    }

    initFunctions(selectedFunctionName?: string) {
        this._globalStateService.setBusyState();
        this._functionsService.clearAllCachedData();

        this._functionsService.getFunctions()
            .subscribe(res => {
                res = Array.isArray(res) ? res : [];
                res.unshift(this._functionsService.getNewFunctionNode());
                this.functionsInfo = res;
                this._globalStateService.clearBusyState();
                if (!this.openAppSettings) {
                    this.resetView(true);
                    this.openIntro = true;
                }
                selectedFunctionName = selectedFunctionName || Cookie.get('functionName');;
                if (selectedFunctionName) {
                    var findSelected = this.functionsInfo.find((f) => {
                        return f.name === selectedFunctionName;
                    });
                    if (findSelected) {
                        this.openIntro = false;
                        this.selectedFunction = findSelected;
                        this.sideBar.selectedFunction = findSelected;
                    }
                }
            },
            (error: Response) => {
                this.functionsInfo = [];
            });
        this._functionsService.warmupMainSite();
        this._functionsService.getHostSecrets();
    }

    onRefreshClicked() {
        this.initFunctions(this.selectedFunction ? this.selectedFunction.name : null);
        this._broadcastService.broadcast(BroadcastEvent.RefreshPortal);
    }

    onChangeTab(event: string) {
        setTimeout(() => {
            this.tabId = event;
        });
    }

    onAppMonitoringClicked() {
        this.resetView(true);
        this.openAppMonitoring = true;
    }

    onAppSettingsClicked() {
        this.resetView(true);
        this.openAppSettings = true;
        this.sideBar.appsettings(false);
    }

    onQuickstartClicked() {
        this.resetView(true);
        this.openIntro = true;
    }

    onSourceControlClicked() {
        this.resetView(true);
        this.openSourceControl = true;
    }

    private resetView(clearFunction: boolean) {
        this.openAppSettings = false;
        this.openAppMonitoring = false;
        this.openIntro = null;
        this.openSourceControl = false;
        if (clearFunction) {
            this.selectedFunction = null;
            if (this.sideBar) {
                this.sideBar.selectedFunction = null;
            }
        }
    }
}

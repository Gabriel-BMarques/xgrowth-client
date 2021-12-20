import { Observable } from 'rxjs';

export interface IAlertControtllerGuard {
  canDeactivate: () => boolean | Observable<boolean> | Promise<boolean>;
}

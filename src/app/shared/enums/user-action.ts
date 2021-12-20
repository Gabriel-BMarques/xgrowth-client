export enum UserActionType {
  View = 1,
  Share = 2,
  ContactEmail = 3,
  ContactTel = 4,
  Impression = 5
}

export namespace UserActionType$ {
  export const $ = 'UserActionType';
  export const $View = 'View';
  export const $Share = 'Share';
  export const $ContactEmail = 'ContactEmail';
  export const $ContactTel = 'ContactTel';
  export const $Impression = 'Impression';
}

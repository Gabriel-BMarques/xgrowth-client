export interface IBriefMarket {
  BriefId?: string;
  MarketType?: number;
  CountryId?: string;
  CreatedBy?: string;
  UpdatedBy?: string;
}

export class BriefMarket implements IBriefMarket {
  constructor(
    public BriefId?: string,
    public MarketType?: number,
    public CountryId?: string,
    public CreatedBy?: string,
    public UpdatedBy?: string
  ) {}
}

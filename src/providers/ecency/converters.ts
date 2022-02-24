import { COIN_IDS } from '../../constants/defaultCoins';
import { Referral } from '../../models';
import { LatestMarketPrices, LatestQuotes, QuoteItem, ReferralStat } from './ecency.types';

export const convertReferral = (rawData: any) => {
  return {
    _id: rawData.id || 0,
    referral: rawData.referral || '',
    referredUsername: rawData.username || '',
    isRewarded: rawData.rewarded ? true : false,
    timestamp: new Date(rawData.created) || new Date(),
  } as Referral;
};

export const convertReferralStat = (rawData: any) => {
  return {
    total: rawData.total || 0,
    rewarded: rawData.rewarded || 0,
  } as ReferralStat;
};

export const convertQuoteItem = (rawData:any) => {
  if(!rawData){
    return null;
  }
  return {
    price:rawData.price,
    percentChange:rawData.percent_change,
    lastUpdated:rawData.last_updated,
  } as QuoteItem
}

export const convertLatestQuotes = (rawData: any, estmPrice:number) => {
  return {
    [COIN_IDS.HIVE]:convertQuoteItem(rawData.hive.quotes.usd),
    [COIN_IDS.HBD]:convertQuoteItem(rawData.hbd.quotes.usd),
    [COIN_IDS.ECENCY]:convertQuoteItem({
      price:estmPrice,
      percent_chagne:0,
      last_updated:new Date().toISOString()
    })

  } as LatestQuotes;
};

import React, { useEffect, useMemo, useState } from 'react';
import { View, Button, Text, Alert, RefreshControl } from 'react-native';
import styles from '../styles/tradeScreen.styles';
import { SwapAmountInput, SwapFeeSection } from '../children';
import { BasicHeader, IconButton, MainButton } from '../../../components';
import { useIntl } from 'react-intl';
import { fetchHiveMarketRate, swapToken } from '../../../providers/hive-trade/hiveTrade';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { MarketAsset, SwapOptions } from '../../../providers/hive-trade/hiveTrade.types';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { showActionModal, toastNotification } from '../../../redux/actions/uiAction';
import { walletQueries } from '../../../providers/queries';
import { useSwapCalculator } from '../children/useSwapCalculator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import EStyleSheet from 'react-native-extended-stylesheet';


const TradeScreen = ({ route }) => {

  const intl = useIntl();
  const dispatch = useAppDispatch();

  //queres
  const assetsQuery = walletQueries.useAssetsQuery();

  const currentAccount = useAppSelector(state => state.account.currentAccount)
  const assetsData = useAppSelector(state => state.wallet.coinsData);
  const pinHash = useAppSelector(state => state.application.pin);
  const isDarkTheme = useAppSelector(state => state.application.isDarkTheme);


  const [fromAssetSymbol, setFromAssetSymbol] = useState(route?.params?.fundType || MarketAsset.HIVE); //TODO: initialise using route params
  const [marketPrice, setMarketPrice] = useState(0);
  const [isInvalidAmount, setIsInvalidAmount] = useState(false);

  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [fromAmount, setFromAmount] = useState('0');

  const _toAssetSymbol = useMemo(() => fromAssetSymbol === MarketAsset.HBD ? MarketAsset.HIVE : MarketAsset.HBD, [fromAssetSymbol])


  const {
    toAmount,
    offerUnavailable,
    tooMuchSlippage,
    isLoading: _isFetchingOrders
  } = useSwapCalculator(fromAssetSymbol, Number(fromAmount) || 0);

  //accumulate asset data properties
  const _fromAssetData = assetsData[fromAssetSymbol === MarketAsset.HBD ? ASSET_IDS.HBD : ASSET_IDS.HIVE];
  const _balance = _fromAssetData.balance;
  const _fromFiatPrice = _fromAssetData.currentPrice;
  const _toFiatPrice = assetsData[_toAssetSymbol === MarketAsset.HBD ? ASSET_IDS.HBD : ASSET_IDS.HIVE].currentPrice
  const _marketFiatPrice = marketPrice * _toFiatPrice;

  const _toAmountStr = toAmount.toFixed(3)


  //initialize market data
  useEffect(() => {
    _fetchMarketRate();
  }, [fromAssetSymbol])


  //post process updated amount value
  useEffect(() => {
    const _value = Number(fromAmount);

    //check for amount validity
    setIsInvalidAmount(_value > _balance)

  }, [fromAmount])


  //fetches and sets market rate based on selected assetew
  const _fetchMarketRate = async () => {
    try {
      setLoading(true)

      //TODO: update marketPrice
      const _marketPrice = await fetchHiveMarketRate(fromAssetSymbol)
      setMarketPrice(_marketPrice);

      setLoading(false)
    } catch (err) {
      Alert.alert("fail", err.message)
    }

  }

  //refreshes wallet data and market rate
  const _refresh = async () => {
    setLoading(true);
    assetsQuery.refetch();
    _fetchMarketRate();
  }


  //initiates swaping action on confirmation
  const _confirmSwap = async () => {
    try {

      setSwapping(true)
      const _fromAmount = Number(fromAmount)

      const data: SwapOptions = {
        fromAsset: fromAssetSymbol,
        fromAmount: _fromAmount,
        toAmount: toAmount
      }

      await swapToken(
        currentAccount,
        pinHash,
        data
      )

      assetsQuery.refetch();

      dispatch(toastNotification("successful swap"));
      setSwapping(false)

    } catch (err) {
      Alert.alert('fail', err.message)
      setSwapping(false)
    }

  }


  //prompts user to verify swap action;
  const handleContinue = () => {

    dispatch(showActionModal({
      title: "confirm swap",
      body: `swaping ${fromAmount} ${fromAssetSymbol} for ${_toAssetSymbol} ${_toAmountStr}`,
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('Swap transaction canceled');
          }
        },
        {
          text: 'Confirm',
          onPress: () => {
            _confirmSwap()
          }
        }
      ]
    }))
  };



  const handleAmountChange = (value: string) => {
    setFromAmount(value);
  };


  const handleAssetChange = () => {
    setFromAssetSymbol(_toAssetSymbol)
    setFromAmount(_toAmountStr);
  }


  const _disabledContinue = _isFetchingOrders || loading || isInvalidAmount || offerUnavailable || !Number(fromAmount)


  const _renderSwapBtn = () => (

    <View style={styles.changeBtnContainer} pointerEvents='box-none'>
      <View style={styles.changeBtn}>
        <IconButton
          style={styles.changeBtnSize}
          color={EStyleSheet.value('$primaryBlue')}
          iconType="MaterialIcons"
          name="swap-vert"
          onPress={handleAssetChange}
          size={44}
        />
      </View>


    </View>

  )


  const _renderContent = () => {
    return (
      <KeyboardAwareScrollView style={styles.container} refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={_refresh}
          progressBackgroundColor="#357CE6"
          tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
          titleColor="#fff"
          colors={['#fff']}
        />
      }>
        <Text style={styles.balance}>{`Balance: ${_balance} ${fromAssetSymbol}`}</Text>

        <View style={{ flex: 1 }}>

          <SwapAmountInput
            label={intl.formatMessage({ id: 'transfer.from' })}
            onChangeText={handleAmountChange}
            value={fromAmount}
            symbol={fromAssetSymbol}
            fiatPrice={_fromFiatPrice}
          />

          <SwapAmountInput
            label={intl.formatMessage({ id: 'transfer.to' })}
            value={_toAmountStr}
            symbol={_toAssetSymbol}
            fiatPrice={_toFiatPrice}
          />
          {_renderSwapBtn()}

        </View>

        {isInvalidAmount && <Text style={{ color: 'red' }} >Please enter valid amount</Text>}
        {tooMuchSlippage && <Text style={{ color: 'red' }} >Too Much Slippage</Text>}
        {offerUnavailable && <Text style={{ color: 'red' }} >Swap not possible for the price, try lower price</Text>}

        <Text style={styles.marketRate}>{`1 ${fromAssetSymbol} = ${marketPrice.toFixed(3)} (${_marketFiatPrice.toFixed(3)})`}</Text>

        <SwapFeeSection />

        <View style={styles.mainBtnContainer}>
          <MainButton
            style={styles.mainBtn}
            isDisable={_disabledContinue}
            onPress={handleContinue}
            isLoading={swapping}
          >
            <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
          </MainButton>
        </View>


      </KeyboardAwareScrollView>

    )
  }


  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'trade.title' })} />
      {_renderContent()}

    </View>
  );
};

export default TradeScreen;
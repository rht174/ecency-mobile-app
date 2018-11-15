import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '$deviceWidth',
    minHeight: 40,
    maxHeight: 74,
    backgroundColor: '$white',
  },
  containerReverse: {
    justifyContent: 'space-between',
    flexDirection: 'row-reverse',
  },
  avatarWrapper: {
    justifyContent: 'center',
  },
  avatarButtonWrapperReverse: {
    borderTopLeftRadius: 68 / 2,
    borderBottomLeftRadius: 68 / 2,
  },
  avatarButtonWrapper: {
    backgroundColor: '#357ce6',
    height: 50,
    width: 68,
    justifyContent: 'center',
  },
  avatarDefault: {
    borderTopRightRadius: 68 / 2,
    borderBottomRightRadius: 68 / 2,
  },
  titleWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '$primaryDarkGray',
  },
  noAuthTitle: {
    fontSize: 14,
    color: '$iconColor',
  },
  subTitle: {
    color: '$primaryDarkGray',
    fontSize: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: 24,
  },
  backButtonWrapper: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
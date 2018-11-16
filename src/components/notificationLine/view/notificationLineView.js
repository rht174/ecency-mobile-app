import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { injectIntl } from 'react-intl';

// Constants

// Components

// Styles
// eslint-disable-next-line
import styles from './notificationLineStyles';

class NotificationLineView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      notification,
      intl: { formatMessage },
    } = this.props;

    return (
      <View
        key={Math.random()}
        style={[styles.notificationWrapper, !notification.read && styles.isNewNotification]}
      >
        <Image
          style={[styles.avatar, !notification.avatar && styles.hasNoAvatar]}
          source={{
            uri: `https://steemitimages.com/u/${notification.source}/avatar/small`,
          }}
        />
        <View style={styles.body}>
          <View style={styles.titleWrapper}>
            <Text style={styles.name}>
              {notification.source}
              {' '}
            </Text>
            <Text style={styles.title}>
              {formatMessage({
                id: `notification.${notification.type}`,
              })}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.description}>
            {notification.description}
          </Text>
        </View>
        {notification.image && (
          <Image
            style={styles.image}
            source={{ uri: notification.image }}
            defaultSource={require('../../../assets/no_image.png')}
          />
        )}
      </View>
    );
  }
}

export default injectIntl(NotificationLineView);
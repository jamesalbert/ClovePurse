import React from 'react';
import { StyleSheet, Button, Text, TextInput, View, AsyncStorage } from 'react-native';
var CryptoJS = require("crypto-js");


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      key: null,
      secret: null,
      balance: 0.0,
      availBalance: 0.0,
      holdBalance: 0.0,
      price: 0.0,
      endpoint: 'https://coinfalcon.com/api/v1'
    }
    this.refresh = this.refresh.bind(this)
    this.headers = this.headers.bind(this)
    this.getSecrets = this.getSecrets.bind(this)
    this.clearSecrets = this.clearSecrets.bind(this)
    this.getSecrets();
  }

  async getSecrets() {
    try {
      const key = await AsyncStorage.getItem('@ClovePurse:key');
      const secret = await AsyncStorage.getItem('@ClovePurse:secret');
      this.setState(prev => {
        return {
          key: key,
          secret: secret
        }
      })
    } catch (error) {
      alert(error);
    }
  }

  async setSecrets() {
    try {
      await AsyncStorage.setItem('@ClovePurse:key', this.state.key);
      await AsyncStorage.setItem('@ClovePurse:secret', this.state.secret);
    } catch (error) {
      alert(error);
    }
  }

  async clearSecrets() {
    try {
      await AsyncStorage.removeItem('@ClovePurse:key');
      await AsyncStorage.removeItem('@ClovePurse:secret');
      this.setState(prev => {
        return {
          key: null,
          secret: null
        }
      });
    } catch (error) {
      alert(error);
    }
  }

  headers(route) {
    timestamp = Math.floor(new Date() / 1000);
    payload = [timestamp, 'GET', route].join('|');
    signature = CryptoJS.HmacSHA256(payload, this.state.secret);
    return {
      "CF-API-KEY": this.state.key,
      "CF-API-TIMESTAMP": timestamp.toString(),
      "CF-API-SIGNATURE": signature.toString()
    }
  }

  refresh() {
    this.setSecrets();
    var headers = this.headers('/api/v1/user/accounts');
    fetch(this.state.endpoint + '/user/accounts', {
      method: 'GET',
      headers: headers
    }).then(resp => {
      data = JSON.parse(resp._bodyInit).data;
      grlc = data[6]
      this.setState(prev => {
        return {
          balance: grlc.balance,
          availBalance: grlc.available_balance,
          holdBalance: grlc.hold_balance
        }
      });
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>ClovePurse</Text>
        <Text>GRLC/USD: ${this.state.price || 0.0}</Text>
        <Text>Balance: {this.state.balance || 0.0} GRLC</Text>
        <Text>Availble Balance: {this.state.availBalance || 0.0} GRLC</Text>
        <Text>On Hold Balance: {this.state.holdBalance || 0.0} GRLC</Text>

        <TextInput
          style={{height: 40, width: "80%", textAlign: "center" }}
          placeholder={this.state.key || "api key"}
          onChangeText={(key) => this.setState({key})}
        />
        <TextInput
          style={{height: 40, width: "80%", textAlign: "center" }}
          placeholder={this.state.secret || "api secret"}
          onChangeText={(secret) => this.setState({secret})}
        />
        <Button
          onPress={this.refresh}
          title="refresh"
          color="grey"
          accessibilityLabel="Refresh Garlicoin Wallet Balance"
        />
        <Button
          onPress={this.clearSecrets}
          title="clear"
          color="red"
          accessibilityLabel="Refresh Garlicoin Wallet Balance"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

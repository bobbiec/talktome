/**
 * Talk to Me React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect, useRef, AppRegistry} from 'react';
import {
  Alert,
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Switch,
  ImageBackground,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SLACK_BOT_TOKEN, SLACK_USER_ID} from './secrets';
import BleManager from 'react-native-ble-manager';
import {stringToBytes} from 'convert-string';
import AsyncStorage, {
  useAsyncStorage,
} from '@react-native-community/async-storage';
import {Button, Divider, Icon, Overlay} from 'react-native-elements';
// import {Icon} from 'react-native-elements';
// import { Icon } from 'react-native-vector-icons/FontAwesome';

const sendMessages = false;

const DEVICE_MAC = 'B8:27:EB:AD:E8:94';
const SERVICE_ID = '00000001-710e-4a5b-8d75-3e5b444b3c3f';
const CHARACTERISTIC_ID = '00000003-710e-4a5b-8d75-3e5b444b3c3f';

enum Status {
  Custom = 'Custom',
  Available = 'Available',
  Busy = 'Busy',
  InMeeting = 'In A Meeting',
  WorkingRemotely = 'Working Remotely',
}

const statusImages = {
  [Status.Custom]: require('./media/custom.png'),
  [Status.Available]: require('./media/available.png'),
  [Status.Busy]: require('./media/busy.png'),
  [Status.InMeeting]: require('./media/inmeeting.png'),
  [Status.WorkingRemotely]: require('./media/workingremotely.png'),
};

const defaultStatusColors = {
  [Status.Custom]: 'rgba(129, 127, 224, 0.3)',
  [Status.Available]: 'rgba(98, 176, 115, 0.3)',
  [Status.Busy]: 'rgba(253, 99, 107, 0.3)',
  [Status.InMeeting]: 'rgba(255, 175, 21, 0.3)',
  [Status.WorkingRemotely]: 'rgba(44, 152, 240, 0.3)',
};

interface LGBIProps {
  imageSource: any;
  children: React.ReactElement;
}

function LinearGradientBackgroundImage(props: LGBIProps) {
  const {imageSource, children, style} = props;
  return (
    <LinearGradient
      colors={['#000000', '#898989']}
      style={{borderRadius: 12, margin: 12, ...style}}>
      <ImageBackground
        source={imageSource}
        style={{}}
        imageStyle={{opacity: 0.2, borderRadius: 12}}>
        {children}
      </ImageBackground>
    </LinearGradient>
  );
}

function App(): React.ReactFragment {
  const [selected, setSelected] = useState(Status.Available);
  const [customText, setCustomText] = useState('');
  const [syncWithSlack, setSyncWithSlack] = useState(false);
  const [debugText, setDebugText] = useState('Debug text');
  const [slackPoller, setSlackPoller] = useState(null);
  const [statusColors, setStatusColors] = useState(defaultStatusColors);
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState(false);

  const buttonPosition = useRef(new Animated.Value(0)).current;

  const {getItem, setItem} = useAsyncStorage('colors');

  async function changeColor(update: object) {
    const newColors = {...statusColors, ...update};
    await setItem(JSON.stringify(newColors));
    setStatusColors(newColors);
  }

  async function getColorsFromStorage() {
    const colors = JSON.parse(await getItem());
    if (colors) {
      await changeColor(colors);
    }
  }

  // uncomment for custom colors
  // useEffect(() => {
  //   getColorsFromStorage();
  // }, []);

  useEffect(() => {
    Animated.timing(buttonPosition, {
      toValue: editing ? -50 : 0,
      duration: 160,
      easing: Easing.elastic(1.5),
      useNativeDriver: true,
    }).start();
  }, [editing]);

  BleManager.start().then(
    () => {},
    // BleManager.scan([], 5).then(setDebugText('BLE Manager started')),
  );

  async function setMessage(s: string) {
    if (!s || !sendMessages) {
      return;
    }
    try {
      await BleManager.connect(DEVICE_MAC);
      const services = await BleManager.retrieveServices(DEVICE_MAC);
      await BleManager.write(
        DEVICE_MAC,
        // string literals don't work for some reason
        services.characteristics[3].service,
        services.characteristics[3].characteristic,
        stringToBytes(s),
      );
    } catch (e) {
      setDebugText(e);
    }
  }

  const highlightIfSelected = (curr: Status) => {
    let style = styles.statusButton;
    if (selected == curr) {
      style = {...style, backgroundColor: statusColors[Status[curr]]};
    }
    return style;
  };

  async function fetchSlackStatus() {
    try {
      const response = await fetch(
        `https://slack.com/api/users.profile.get` +
          `?token=${SLACK_BOT_TOKEN}` +
          `&user=${SLACK_USER_ID}`,
      );
      const responseJson = await response.json();
      const statusText = responseJson.profile.status_text;
      setSelected(Status.Custom);
      if (customText !== statusText) {
        setCustomText(statusText);
        setMessage(customText);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        {/* <TouchableOpacity
          onPress={async () => {
            const [r, g, b, a] = [
              Math.random() * 255,
              Math.random() * 255,
              Math.random() * 255,
              Math.random(),
            ];
            await changeColor({
              [Status.Available]: `rgba(${r}, ${g}, ${b}, ${a})`,
            });
            setDebugText(`set to ${r} ${g} ${b} ${a}`);
          }}>
          <Text style={{padding: 24}}>{debugText || 'debug text (none)'}</Text>
        </TouchableOpacity> */}
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.sectionContainer}>
            <View style={styles.flexRow}>
              <TouchableOpacity
                onPress={async () => setModal(true)}
                style={styles.sectionTitle}>
                <Text style={styles.sectionTitle}>Dash</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={async () => fetchSlackStatus()}>
                <Text style={{color: 'white', padding: 2}}>
                  Sync with Slack
                </Text>
              </TouchableOpacity>
              <Switch
                value={syncWithSlack}
                onValueChange={(val: boolean) => {
                  if (slackPoller) {
                    clearInterval(slackPoller);
                  }
                  if (val) {
                    const newPoller = setInterval(fetchSlackStatus, 6000);
                    setSlackPoller(newPoller);
                  } else {
                    setSlackPoller(null);
                  }
                  setSyncWithSlack(val);
                }}
                thumbColor="#F2F2F2"
                trackColor={{
                  false: '#383838',
                  true: '#7a1d7a',
                }}
                style={{paddingLeft: 8}}
              />
            </View>
          </View>

          <Overlay
            isVisible={modal}
            onBackdropPress={() => setModal(false)}
            overlayStyle={{
              flex: 1,
              maxHeight: 512,
              marginTop: 24,
              backgroundColor: '#817fe0',
            }}>
            <KeyboardAvoidingView behavior="position" enabled>
              <TextInput
                autoFocus
                style={{
                  backgroundColor: '#5653b5',
                  padding: 8,
                  borderRadius: 4,
                  marginBottom: 12,
                }}
                onChangeText={text => setCustomText(text)}
                onSubmitEditing={nativeEvent => {
                  setMessage(nativeEvent.text);
                  setSelected(Status.Custom);
                }}
                value={customText}
                placeholder="Write a custom status..."
                placeholderTextColor="#d4d4d4"
                blurOnSubmit={true}
                returnKeyType={'done'}
              />
              <View>
                <Text style={{fontWeight: 'bold', color: '#e4e4e4'}}>
                  {' '}
                  Recents:{' '}
                </Text>
                <View style={{paddingLeft: 8, paddingRight: 8}}>
                  <FlatList
                    data={[
                      {
                        message: 'Going for a short walk',
                        enabled: false,
                      },
                      {
                        message: 'In the lounge',
                        enabled: false,
                      },
                      {
                        message: 'Taking a phone call',
                        enabled: true,
                      },
                    ]}
                    renderItem={({item}) => (
                      <>
                        <Text
                          style={{
                            paddingTop: 8,
                            paddingBottom: 8,
                            color: '#e4e4e4',
                          }}>
                          {item.message}
                        </Text>
                        <Icon
                          name="home"
                          // size={50}
                          iconStyle={{
                            borderColor: '#5653b5',
                            position: 'absolute',
                            right: 0,
                            bottom: 4,
                          }}
                          color={item.enabled ? '#e4e4e4' : '#5653b5'}
                        />
                        <Divider />
                      </>
                    )}
                    keyExtractor={item => item.message}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </Overlay>

          <View style={styles.sectionContainer}>
            {/* current status*/}
            <View>
              <Text style={styles.statusTitle}>
                <Text
                  style={{
                    color: statusColors[Status[selected]].replace('0.3', '1.0'),
                  }}>
                  ⬤{'  '}
                </Text>
                {selected == Status.Custom ? customText : Status[selected]}
                {'\n'}
              </Text>
            </View>
          </View>
          <Divider />
          <View>
            <View style={styles.sectionContainer}>
              <View style={styles.flexRow}>
                <Text style={styles.sectionTitle}>Update Status</Text>
                <TouchableOpacity
                  onPress={async () => {
                    setEditing(!editing);
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      padding: 2,
                      fontSize: 24,
                      fontWeight: 'bold',
                    }}>
                    +{/* {editing ? 'Save' : 'Edit'} */}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sectionContainer}>
              {/* list of possible status*/}
              {/* <TouchableOpacity
                onPress={() => {
                  setSelected(Status.Custom);
                  setMessage(customText);
                }}>
                <LinearGradientBackgroundImage
                  imageSource={statusImages[Status.Custom]}>
                  <Text style={highlightIfSelected(Status.Custom)}>
                    Custom Status
                  </Text>
                </LinearGradientBackgroundImage>

                {// TODO: move this to replace the top indicator when custom
                selected == Status.Custom && (
                  <TextInput
                    autoFocus
                    style={styles.customStatusInput}
                    onChangeText={text => setCustomText(text)}
                    onSubmitEditing={nativeEvent =>
                      setMessage(nativeEvent.text)
                    }
                    value={customText}
                    placeholder="Your text here"
                    placeholderTextColor="#b4b4b4"
                    blurOnSubmit={true}
                  />
                )} */}
              {/* </TouchableOpacity> */}
              {Object.keys(Status).map((status: Status) => {
                if (status == Status.Custom) {
                  return null;
                }
                return (
                  <Animated.View key={status} style={styles.flexRow}>
                    <TouchableOpacity
                      style={[
                        {width: '100%'},
                        {transform: [{translateX: buttonPosition}]},
                      ]}
                      onPress={() => {
                        setSelected(status);
                        setMessage(Status[status]);
                      }}>
                      <LinearGradientBackgroundImage
                        imageSource={statusImages[Status[status]]}>
                        <Text style={highlightIfSelected(status)}>
                          {Status[status]}
                        </Text>
                      </LinearGradientBackgroundImage>
                    </TouchableOpacity>
                    {editing && (
                      <View style={{float: 'right'}}>
                        <Icon
                          name="delete-forever"
                          size={50}
                          color="#b04"
                          underlayColor="#b37"
                          onPress={() =>
                            Alert.alert(
                              null,
                              'Are you sure you want to delete your Dash status' +
                                ` ${Status[status]}?`,
                              [
                                {
                                  text: "Don't Delete",
                                  onPress: () => console.log('Cancel Pressed'),
                                  style: 'cancel',
                                },
                                {
                                  text: 'Delete',
                                  onPress: () => console.log('OK Pressed'),
                                },
                              ],
                              {cancelable: false},
                            )
                          }
                          containerStyle={{paddingTop: 20, marginLeft: -40}}
                        />
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#282828',
    height: '100%',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    marginRight: 'auto',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  statusButton: {
    color: 'white',
    padding: 24,
    backgroundColor: 'rgba(63,63,63,0.3)',
    textAlign: 'center',
    borderRadius: 12,
    opacity: 1.0,
  },
  customStatusInput: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
    textAlign: 'center',
    color: 'white',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default App;

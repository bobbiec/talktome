/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Switch,
  Button,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SLACK_BOT_TOKEN, SLACK_USER_ID} from './secrets';

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

const statusColors = {
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
  const {imageSource, children} = props;
  return (
    <LinearGradient
      colors={['#000000', '#898989']}
      style={{borderRadius: 12, margin: 12}}>
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

  const highlightIfSelected = (curr: Status) => {
    let style = styles.statusButton;
    if (selected == curr) {
      style = {...style, backgroundColor: statusColors[Status[curr]]};
    }
    return style;
  };

  const fetchSlackStatus = async () => {
    try {
      let response = await fetch(
        `https://slack.com/api/users.profile.get` +
          `?token=${SLACK_BOT_TOKEN}` +
          `&user=${SLACK_USER_ID}`,
      );
      let responseJson = await response.json();
      setDebugText(responseJson.profile.status_text);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <TouchableOpacity onPress={async () => fetchSlackStatus()}>
          <Text style={{padding: 24}}>{debugText || 'debug text (none)'}</Text>
        </TouchableOpacity>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.sectionContainer}>
            <View>
              <View>
                <View style={styles.syncSlackSwitch}>
                  <Text style={styles.sectionTitle}>Talk to Me</Text>
                  <Text style={{color: 'white', top: 2}}>Sync with Slack</Text>
                  <Switch
                    value={syncWithSlack}
                    onValueChange={(val: boolean) => setSyncWithSlack(val)}
                    thumbColor="#F2F2F2"
                    trackColor={{
                      false: '#383838',
                      true: '#7a1d7a',
                    }}
                    style={{paddingLeft: 8}}
                  />
                </View>
                {/* <Button title="Pull from Slack" /> */}
              </View>
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <View>
              <Text style={styles.statusTitle}>
                <Text
                  style={{
                    color: statusColors[Status[selected]].replace('0.3', '1.0'),
                  }}>
                  ⬤{'  '}
                </Text>
                {selected == Status.Custom ? customText : Status[selected]}
              </Text>
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <TouchableOpacity onPress={() => setSelected(Status.Custom)}>
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
                  value={customText}
                  placeholder="Your text here"
                  placeholderTextColor="#b4b4b4"
                  blurOnSubmit={true}
                />
              )}
            </TouchableOpacity>
            {Object.keys(Status).map((status: Status) =>
              status == Status.Custom ? null : (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelected(status)}>
                  <LinearGradientBackgroundImage
                    imageSource={statusImages[Status[status]]}>
                    <Text style={highlightIfSelected(status)}>
                      {Status[status]}
                    </Text>
                  </LinearGradientBackgroundImage>
                </TouchableOpacity>
              ),
            )}
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
  syncSlackSwitch: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default App;

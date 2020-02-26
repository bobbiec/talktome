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
} from 'react-native';

enum Status {
  Custom = 'Custom',
  Available = 'Available',
  Busy = 'Busy',
  InMeeting = 'In A Meeting',
  WorkingRemotely = 'Working Remotely',
}

function App(): React.ReactFragment {
  const [selected, setSelected] = useState(Status.Available);
  const [customText, setCustomText] = useState('');
  const [syncWithSlack, setSyncWithSlack] = useState(false);

  const greenIfSelected = (curr: Status) => {
    let style = styles.statusButton;
    if (selected == curr) {
      style = {...style, backgroundColor: 'green'};
    }
    return style;
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.sectionContainer}>
        <View>
          <Text style={styles.sectionTitle}>Talk to Me</Text>
          <View>
            <View style={styles.syncSlackSwitch}>
              <Text>Sync with Slack</Text>
              <Switch
                value={syncWithSlack}
                onValueChange={(val: boolean) => setSyncWithSlack(val)}
              />
            </View>
            <Button title="Pull from Slack" />
          </View>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <View>
          <Text style={styles.statusTitle}>
            Currently:{' '}
            {selected == Status.Custom ? customText : Status[selected]}
          </Text>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <TouchableOpacity onPress={() => setSelected(Status.Custom)}>
          <Text style={greenIfSelected(Status.Custom)}>Custom Status</Text>
          {selected == Status.Custom && (
            <TextInput
              autoFocus
              style={styles.customStatusInput}
              onChangeText={text => setCustomText(text)}
              value={customText}
              placeholder="Your text here"
            />
          )}
        </TouchableOpacity>
        {Object.keys(Status).map((status: Status) =>
          status == Status.Custom ? null : (
            <TouchableOpacity key={status} onPress={() => setSelected(status)}>
              <Text style={greenIfSelected(status)}>{Status[status]}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusButton: {
    backgroundColor: 'yellow',
    color: 'black',
    padding: 24,
    margin: 12,
    textAlign: 'center',
  },
  customStatusInput: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    margin: 12,
    marginTop: 0,
    textAlign: 'center',
  },
  syncSlackSwitch: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default App;

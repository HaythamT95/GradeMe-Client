import {
  checkFileIsAvailable,
  downloadFileFromUri,
  openDownloadedFile,
} from "expo-downloads-manager";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { IconButton } from "react-native-paper";

export default function Download(URL,FileName) {
  const [downloadStatus, setDownloadStatus] = useState("NOTSTARTED");
  const [downloadProgress, setDownloadProgress] = useState(0);

  const uri = URL;
  const fileName = FileName;

  const callback = (downloadProgress) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    setDownloadProgress(progress);
  };

  async function checkAvail() {
    const { isAvailable } = await checkFileIsAvailable(fileName);
    if (isAvailable) {
      setDownloadStatus("FINISHED");
    }
  }

  useEffect(() => {
    checkAvail();
  }, [uri]);

  return (
    <View style={styles.container}>
      {downloadStatus == "NOTSTARTED" && (
        <IconButton
          icon="download"
          color="white"
          size={24}
          style={{ backgroundColor: "#1890FF", marginHorizontal: 10 }}
          onPress={async () => {
            setDownloadStatus("DOWNLOADING");
            
            const { status, error } = await downloadFileFromUri(
              uri,
              fileName,
              callback
            );

            switch (status) {
              case "finished":
                setDownloadStatus("FINISHED");
                break;
              case "error":
                setDownloadStatus("ERROR");
                break;
              default:
                break;
            }
          }}
        />
      )}
      {downloadStatus == "DOWNLOADING" && (
        <View style={{ marginHorizontal: 10 }}>
          <AnimatedCircularProgress
            size={40}
            width={3}
            fill={downloadProgress}
            tintColor="white"
            backgroundColor="#1890FF"
          >
            {(fill) => (
              <IconButton
                icon="pause"
                color="white"
                size={20}
                style={{ backgroundColor: "#1890FF" }}
                onPress={async () => {}}
              />
            )}
          </AnimatedCircularProgress>
        </View>
      )}
      {downloadStatus == "FINISHED" && (
        <IconButton
          icon="file"
          color="white"
          size={24}
          style={{ backgroundColor: "#1890FF", marginHorizontal: 10 }}
          onPress={async () => {
            await openDownloadedFile(fileName);
          }}
        />
      )}
      {downloadStatus == "ERROR" && (
        <IconButton
          icon="error"
          color="white"
          size={24}
          style={{ backgroundColor: "#1890FF", marginHorizontal: 10 }}
          onPress={async () => {
            setDownloadStatus("DOWNLOADING");

            const { status, error } = await downloadFileFromUri(
              uri,
              fileName,
              callback
            );

            switch (status) {
              case "finished":
                setDownloadStatus("FINISHED");
                break;
              case "error":
                setDownloadStatus("ERROR");
                break;
              default:
                break;
            }
          }}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
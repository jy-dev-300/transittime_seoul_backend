// No	출력명	출력설명
// 공통	list_total_count	총 데이터 건수 (정상조회 시 출력됨)
// 공통	RESULT.CODE	요청결과 코드 (하단 메세지설명 참고)
// 공통	RESULT.MESSAGE	요청결과 메시지 (하단 메세지설명 참고)
// 1	subwayId	지하철호선ID
// (1001:1호선, 1002:2호선, 1003:3호선, 1004:4호선, 1005:5호선 1006:6호선, 1007:7호선, 1008:8호선, 1009:9호선, 1061:중앙선1063:경의중앙선, 1065:공항철도, 1067:경춘선, 1075:수의분당선 1077:신분당선, 1092:우이신설선, 1093:서해선, 1081:경강선, 1032:GTX-A)
// 2	updnLine	상하행선구분
// (0 : 상행/내선, 1 : 하행/외선)
// 3	trainLineNm	도착지방면
// (성수행(목적지역) - 구로디지털단지방면(다음역))
// 5	statnFid	이전지하철역ID
// 6	statnTid	다음지하철역ID
// 7	statnId	지하철역ID
// 8	statnNm	지하철역명
// 9	trnsitCo	환승노선수
// 10	ordkey	도착예정열차순번
// (상하행코드(1자리), 순번(첫번째, 두번째 열차 , 1자리), 첫번째 도착예정 정류장 - 현재 정류장(3자리), 목적지 정류장, 급행여부(1자리))
// 11	subwayList	연계호선ID
// (1002, 1007 등 연계대상 호선ID)
// 12	statnList	연계지하철역ID
// (1002000233, 1007000000)
// 13	btrainSttus	열차종류
// (급행,ITX,일반,특급)
// 14	barvlDt	열차도착예정시간
// (단위:초)
// 15	btrainNo	열차번호
// (현재운행하고 있는 호선별 열차번호)
// 16	bstatnId	종착지하철역ID
// 17	bstatnNm	종착지하철역명
// 18	recptnDt	열차도착정보를 생성한 시각
// 19	arvlMsg2	첫번째도착메세지
// (도착, 출발 , 진입 등)
// 20	arvlMsg3	두번째도착메세지
// (종합운동장 도착, 12분 후 (광명사거리) 등)
// 21	arvlCd	도착코드
// (0:진입, 1:도착, 2:출발, 3:전역출발, 4:전역진입, 5:전역도착, 99:운행중)
// // 22	lstcarAt	막차여부
// // (1:막차, 0:아님)

// json response is a dict-> key: row || values: array of dictionaries

// have the response be all directions of the given lineID and their time remaining
export interface ArrivalInfo {
    subwayId: string[];
    statnNm: string[];
    barvlDt: string[];
    trainLineNM: string[]; //도착지방면, i.e. (성수행(목적지역) - 구로디지털단지방면(다음역))
  }

const subwayLines: { [key: string]: number } = {
    '1호선': 1001,
    '2호선': 1002,
    '3호선': 1003,
    '4호선': 1004,
    '5호선': 1005,
    '6호선': 1006,
    '7호선': 1007,
    '8호선': 1008,
    '9호선': 1009,
    '중앙선': 1061,
    '경의중앙선': 1063,
    '공항철도': 1065,
    '경춘선': 1067,
    '수의분당선': 1075,
    '신분당선': 1077,
    '우이신설선': 1092,
    '서해선': 1093,
    '경강선': 1081,
    'GTX-A': 1032
  };

// Function to get the barvlDt (time until arrival) based on stationName and lineName

export const getTrainInfoAndArrivalTime = (
  responseDict: { [key: string]: any },  // Dictionary structure
  stationName: string, 
  lineName: string,
): { [key: string]: any }[] | null => {
  // Get the lineID from the subwayLines dictionary
  const lineID = subwayLines[lineName];
  const listOfTrainInfoDicts: { [key: string]: any }[] = [];


  if (!lineID) {
    console.log(`Line ${lineName} not found.`);
    return null;
  }

  // Access the `row` array inside `realtimeStationArrival`
  const rows = responseDict?.realtimeStationArrival?.row;
  if (!Array.isArray(rows)) {
    console.log("No valid rows found in responseDict.");
    return null;
  }

  console.log(`Searching for stationName: ${stationName}, lineID: ${lineID}`);

  // Normalize the input stationName by trimming and converting to lowercase
  const normalizedStationName = stationName.trim().toLowerCase();

  // Iterate over the array of entries in the row


  for (const entry of rows) {
    console.log(`Checking entry with subwayId: ${entry.subwayId}, statnNm: ${entry.statnNm}`);

    // Ensure subwayId and statnNm are present, and handle them as arrays
    const entrySubwayId = Array.isArray(entry.subwayId) ? entry.subwayId[0] : entry.subwayId;
    const entryStatnNm = Array.isArray(entry.statnNm) ? entry.statnNm[0] : entry.statnNm;

    if (!entrySubwayId || !entryStatnNm) {
      console.log("Entry missing subwayId or statnNm.");
      continue;
    }

    // Normalize statnNm from the entry (trim and convert to lowercase)
    const normalizedStatnNm = entryStatnNm.trim().toLowerCase();

    // Check if the subwayId and statnNm match the provided lineID and station name
    if (entrySubwayId === lineID.toString() && normalizedStatnNm === normalizedStationName) {
      console.log(`Match found for stationName: ${entryStatnNm}, subwayId: ${entrySubwayId}`);

      // Check if these fields exist and is not empty
      const entryBarvlDt = Array.isArray(entry.barvlDt) ? entry.barvlDt[0] : entry.barvlDt;
      const direction = Array.isArray(entry.trainLineNm) ? entry.trainLineNm[0] : entry.trainLineNm; //trainLineNm
      const typeOfTrain = Array.isArray(entry.btrainSttus) ? entry.btrainSttus[0] : entry.btrainSttus; //btrainSttus
      const isLastTrain = Array.isArray(entry.lstcarAt) ? entry.lstcarAt[0] : entry.lstcarAt//lstcarAt

      if (entryBarvlDt !== undefined && entryBarvlDt !== null && entryBarvlDt !== '' && 
          direction !== undefined && direction !== null && direction !== '' && 
          typeOfTrain !== undefined && typeOfTrain !== null && typeOfTrain !== '' && 
          isLastTrain !== undefined && isLastTrain !== null && isLastTrain !== '' ) {

          const trainInfoToSendToFrontend = {
            stationName: stationName,
            lineName: lineName,
            direction: direction,
            typeOfTrain: typeOfTrain,
            isLastTrain: isLastTrain,
            arrivalTime: Math.round(Number(entryBarvlDt) / 60).toString() // Convert seconds to minutes and store as string
          };
              listOfTrainInfoDicts.push(trainInfoToSendToFrontend)

      } else {
        console.log(`somedata is missing or empty for entry: ${JSON.stringify(entry)}, which is for ${stationName}`);
        return null;
      }
    }
  }

  return listOfTrainInfoDicts;

  // If no match is found
  console.log(`No arrival info found for lineID ${lineID} and station ${stationName}.`);
  return null;
};










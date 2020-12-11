const express = require("express");
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://admin:mohamedZoweil@cluster0.grxvp.mongodb.net/topicsAndQuestions?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("topicsAndQuestions");
    const collection = database.collection("topicsTest2");
    let newVa;
   
    level1TopicsFinal.forEach(level1FinalTopic => {
      newVa ={ $set: {level1FinalTopic}};
      collection.updateOne(level1FinalTopic,newVa,{upsert: true});

    });
    level2TopicsFinal.forEach(level2FinalTopic => {
      newVa ={ $set: {level2FinalTopic}};
      collection.updateOne(level2FinalTopic,newVa,{upsert: true});

    });

    level3TopicsFinal.forEach(level3FinalTopic => {
      newVa ={ $set: {level3FinalTopic}};
      collection.updateOne(level3FinalTopic,newVa,{upsert: true});

    });

    let result = [];
    app.get('/search/', (req, res) => {
      result.length = 0;
      let query ={_id: req.query.q} ;
      const cursor = collection.find(query);
      if(typeof(cursor.questionNumber) =="undefined"){
        console.log("No questions found");
       
      }
      
      cursor.forEach(cu =>{
        console.log(cu.questionNumber);
        result = {topicName: cu._id, questionNumber:cu.questionNumber};
        console.log(result);
        res.json(result);
      });
      
    });
  } finally {
    //await client.close();
  }
}
run();

const csv = require("csv-parser");
const fs = require("fs");
const resultsQuestions = [];
const resultsTopics = [];
const level1Array = [];
const level2Array = [];
const level3Array = [];
const questionsArray = [];
let uniqueLevel1TopicsArray = [];
let uniqueLevel2TopicsArray = [];
let uniqueLevel3TopicsArrayPre = [];
let uniqueLevel3TopicsArray = [];
let i = 0;
let level1TopicsFinal = [{}];
let level2TopicsFinal = [{}];
let level3TopicsFinal = [{}];
let questionNumberArray = [];
fs.createReadStream("Questions and Topics - Topics.csv")
  .pipe(csv())
  .on("data", (row) => {
    resultsTopics.push(row);
    level1Array.push(resultsTopics[i].topicLevel1);
    level2Array.push(resultsTopics[i].topicLevel2);
    level3Array.push(resultsTopics[i].topicLevel3);
    i++;
  })
  .on("end", () => {
    console.log("CSV file successfully processed (Topics)");

    uniqueLevel1TopicsArray = Array.from(new Set(level1Array));
    uniqueLevel2TopicsArray = Array.from(new Set(level2Array));
    uniqueLevel3TopicsArrayPre = Array.from(new Set(level3Array));
    //this block removes the empty string of the level 3 topics
    for (index = 0; index < uniqueLevel3TopicsArrayPre.length; index++) {
      if (uniqueLevel3TopicsArrayPre[index].length > 0)
        uniqueLevel3TopicsArray.push(uniqueLevel3TopicsArrayPre[index]);
    }
  });
fs.createReadStream("Questions and Topics - Questions.csv")
  .pipe(csv())
  .on("data", (row) => {
    resultsQuestions.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed (Questions)");
    //assign questions' numbers to each topic in level 1 topics
    uniqueLevel1TopicsArray.forEach((element) => {
      for (let index = 0; index < resultsQuestions.length; index++) {
        if (
          element === resultsQuestions[index].annotation1 ||
          element === resultsQuestions[index].annotation2 ||
          element === resultsQuestions[index].annotation3 ||
          element === resultsQuestions[index].annotation4 ||
          element === resultsQuestions[index].annotation5
        ) {
          questionNumberArray.push(resultsQuestions[index].questionNumber);
        }
      }

      level1TopicsFinal.push({
        _id: element,
        questionNumber: Array.from(questionNumberArray),
      });

      questionNumberArray.length = 0;

    });

    //assign questions' numbers to each topic in level 2 topics
    uniqueLevel2TopicsArray.forEach((element) => {
      for (let index = 0; index < resultsQuestions.length; index++) {
        if (
          element === resultsQuestions[index].annotation1 ||
          element === resultsQuestions[index].annotation2 ||
          element === resultsQuestions[index].annotation3 ||
          element === resultsQuestions[index].annotation4 ||
          element === resultsQuestions[index].annotation5
        ) {
          questionNumberArray.push(resultsQuestions[index].questionNumber);
        }
      }

      level2TopicsFinal.push({
        _id: element,
        questionNumber: Array.from(questionNumberArray),
      });

      questionNumberArray.length = 0;
    });

    //assign questions' numbers to each topic in level 3 topics
    uniqueLevel3TopicsArray.forEach((element) => {
      for (let index = 0; index < resultsQuestions.length; index++) {
        if (
          element === resultsQuestions[index].annotation1 ||
          element === resultsQuestions[index].annotation2 ||
          element === resultsQuestions[index].annotation3 ||
          element === resultsQuestions[index].annotation4 ||
          element === resultsQuestions[index].annotation5
        ) {
          questionNumberArray.push(resultsQuestions[index].questionNumber);
        }
      }

      level3TopicsFinal.push({
        _id: element,
        questionNumber: Array.from(questionNumberArray),
      });

      questionNumberArray.length = 0;

    });

    uniqueLevel2TopicsArray.forEach((element) => {
      let testArr = resultsTopics.filter((el) => el.topicLevel2 === element);
      questionNumberArray.length = 0;
      level3TopicsFinal.forEach((level3FinalTopic) => {
        if (typeof level3FinalTopic._id != "undefined") {
          for (let k = 0; k < testArr.length; k++) {
            if (testArr[k].topicLevel3.length > 0) {
              if (level3FinalTopic._id === testArr[k].topicLevel3) {
                for (
                  let j = 0;
                  j < level3FinalTopic.questionNumber.length;
                  j++
                ) {
                  questionNumberArray.push(level3FinalTopic.questionNumber[j]);
                }
              }
            }
          }
        }
      });

      level2TopicsFinal.forEach((level2FinalTopic) => {
        if (level2FinalTopic._id === element) {
          for (let j = 0; j < questionNumberArray.length; j++) {
            level2FinalTopic.questionNumber.push(questionNumberArray[j]);
          }
        }
      });
    });





    uniqueLevel1TopicsArray.forEach((element) => {
      let testArr = resultsTopics.filter((el) => el.topicLevel1 === element);
      //console.log(testArr.topicLevel3);
      questionNumberArray.length = 0;
      level2TopicsFinal.forEach((level2FinalTopic) => {
        if (typeof level2FinalTopic._id != "undefined") {
          for (let k = 0; k < testArr.length; k++) {
            if (testArr[k].topicLevel2.length > 0) {
              if (level2FinalTopic._id === testArr[k].topicLevel2) {
                for (let j = 0;j < level2FinalTopic.questionNumber.length;j++) {
                  questionNumberArray.push(level2FinalTopic.questionNumber[j]);
                }
              }
            }
          }
        }
      });

      level1TopicsFinal.forEach((level1FinalTopic) => {
        if (level1FinalTopic._id === element) {
          for (let j = 0; j < questionNumberArray.length; j++) {
            level1FinalTopic.questionNumber.push(questionNumberArray[j]);
          }
        }
      });
      level1TopicsFinal.forEach((level1FinalTopic)=>{
        level1FinalTopic.questionNumber = Array.from(new Set(level1FinalTopic.questionNumber));


      })
      
    
    });
  });

app.listen(3000, function () {
  console.log("Server is running on port: 3000");
});
app.get("/", (req, res) => {
  res.send("hello world");
});


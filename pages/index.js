import Image from 'next/image'
import { useEffect, useState } from "react";
import { Segment, useDefault } from 'segmentit';

const useLocalStorage = (storageKey, fallbackState) => {
  if (typeof window !== "undefined") {
    const [value, setValue] = useState(
      JSON.parse(localStorage.getItem(storageKey)) || fallbackState
    );

    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);
    return [value, setValue];
  }
  return useState(fallbackState);
};


export default function Home() {
  
  const [questions, setQuestions] = useLocalStorage("questions", "");
  const [results, setResults] = useLocalStorage("results", "");


  const deal = () => {
    // 对题库进行中文分词处理
    // const segmentit = new Segment();
    const segmentit = useDefault(new Segment());
    const segmentResult = segmentit.doSegment(questions);
    // 统计每个词的数量
    const wordCount = {};
    segmentResult.forEach((item) => {
      if (wordCount[item.w] === undefined) {
        wordCount[item.w] = 1;
      } else {
        wordCount[item.w] += 1;
      }
    });
    // 题目按照序号分割
    const list = questions.split(/\n\d+、/g).filter((item) => item !== "" && item !== "、");
    
    // 每一道题都要有两个关键词，关键词按照数量排序，取最少出现的两个，添加高亮html element
    let rawResults = "";
    // list.forEach((item, index) => {
      // 改成for
    for (let index = 0; index < list.length; index++) {
      // const item = list[index];
      // 只对第一行高亮
      const item = list[index].split("\n")[0];
      // 对每一道题进行分词
      const segmentResult = segmentit.doSegment(item);
      // 统计每个词的数量
      const wordCount = {};
      segmentResult.forEach((item) => {
        // 不统计标点符号
        if (item.p === 2048) { // 2048是标点符号的词性
          return;
        }

        if (wordCount[item.w] === undefined) {
          wordCount[item.w] = 1;
        } else {
          wordCount[item.w] += 1;
        }
      });
      // 对词频进行排序
      const wordCountArr = Object.entries(wordCount).sort(
        (a, b) => a[1] - b[1]
      );
      // 取最少出现的两个词
      const keyword = wordCountArr.slice(0, 2).map((item) => item[0]);
      // 高亮处理
      const keywordReg = new RegExp(keyword.join("|").replace(/\(/g, "\\(").replace(/\)/g, "\\)"), "g");
      
      const result = item.replace(
        keywordReg,
        // 要荧光笔的效果
        (match) => `<span style='background-color: rgb(253, 224, 71)'>${match}</span>`
      );
      // 拼接后面几行
      const otherLines = list[index].split("\n").slice(1).join("\n");
      // 拼接结果
      rawResults += `${index + 1}、${result}\n${otherLines}\n`;
    }
    rawResults = rawResults.replace(/\n/g, "<br />");
    setResults(rawResults);
    console.log(results);
  }
    

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <div className={`flex flex-col items-center justify-center`}>
        <h1 className={`text-6xl font-bold`}>题库关键词高亮工具</h1>
        <p className={`text-2xl mt-4`}>将题库中的关键词高亮显示</p>
        <button className="w-64 btn mt-4" onClick={deal}>
          高亮处理
        </button>
      </div>
      {/* 左右为 daisyUI 卡片样式，左侧是原题库文本框，右侧是光亮后的文本，1:1 */}
      <div className={`flex flex-col md:flex-row w-full mt-8 flex-1 gap-2`}>
        <div className={`card shadow-lg w-full md:w-1/2 bg-base-100`}>
          <div className={`card-body`}>
            <h2 className={`card-title`}>原题库文本框</h2>
            <textarea
              className={`form-control textarea h-full textarea-bordered`}
              spellCheck={false}
              value={questions}
              onChange={(e) => {
                setQuestions(e.target.value);
              }}
              placeholder={`请输入题库文本`}
            ></textarea>
          </div>
        </div>
        {/* <div className={`card shadow-lg w-full md:w-1/2 mt-4 md:mt-0`}> */}
        {/* 换成daisyui主题底色 */}
        <div className={`card shadow-lg w-full md:w-1/2 mt-4 md:mt-0 bg-base-100`}>
          <div className={`card-body`}>
            <h2 className={`card-title`}>高亮后的文本</h2>
            {/* 展示results中的html */}
            <div
              className={`textarea h-full textarea-bordered`}
              dangerouslySetInnerHTML={{ __html: results }}
            ></div>
            
            
          </div>
        </div>
      </div>
      
    </main>
  )
}

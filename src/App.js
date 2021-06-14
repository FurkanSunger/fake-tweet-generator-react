import { createRef, useEffect, useState } from "react";
import "./App.css";
import {
  ReplyIcon,
  LikeIcon,
  ShareIcon,
  RetweetIcon,
  VerifiedIcon,
} from "./icons";
import { AvatarLoader } from "./loader";
import { useScreenshot } from "use-react-screenshot";
import { language } from "./language";

function App() {
  const tweetRef = createRef(null);
  const downloadRef = createRef();

  const [avatar, setAvatar] = useState();
  const [name, setName] = useState();
  const [username, setUsername] = useState();
  const [tweet, setTweet] = useState();
  const [verified, setVerified] = useState(0);
  const [retweet, setRetweet] = useState(0);
  const [quoteTweets, setQuoteTweets] = useState(0);
  const [likes, setLikes] = useState(0);
  const [image, takeScreenshot] = useScreenshot();
  const [lang, setLang] = useState("tr");
  const [langText, setLangText] = useState(language[lang]);

  const getImage = () => takeScreenshot(tweetRef.current);

  useEffect(() => {
    if (image) {
      downloadRef.current.click();
    }
  }, [image]);

  useEffect(() => {
    setLangText(language[lang]);
  }, [lang]);

  function convertImgToBase64(url, callback, outputFormat) {
    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      var dataURL = canvas.toDataURL(outputFormat || "image/png");
      callback.call(this, dataURL);
      // Clean up
      canvas = null;
    };
    img.src = url;
  }

  const tweetFormat = (tweet) => {
    tweet = tweet
      .replace(/@([\w]+)/g, "<span>@$1</span>")
      .replace(/#([\wşçöğüı]+)/gi, "<span>#$1</span>")
      .replace(/(https?:\/\/[\w\.\/]+)/g, "<span>$1</span>");
    return tweet;
  };

  const formatNumber = (number) => {
    if (!number) {
      number = 0;
    }
    if (number < 1000) {
      return number;
    }
    number /= 1000;
    number = String(number).split(".");
    return (
      number[0] + (number[1] > 100 ? "," + number[1].slice(0, 1) + " B" : "B")
    );
  };

  const avatarHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      setAvatar(this.result);
    });
    reader.readAsDataURL(file);
  };

  const fetchTwitterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`
    )
      .then((res) => res.json())
      .then((data) => {
        const twitter = data[0];
        convertImgToBase64(
          twitter.profile_image_url_https,
          function (base64Image) {
            setAvatar(base64Image);
          }
        );
        setName(twitter.name);
        setUsername(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetweet(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };

  return (
    <>
      <div className="settings">
        <h3>{langText?.settings}</h3>
        <ul>
          <li>
            <label>{langText.name}</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </li>
          <li>
            <label>{langText.username}</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              className="textarea"
              maxLength="380"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
            ></textarea>
          </li>
          <li>
            <label>{langText.picture}</label>
            <input type="file" className="input" onChange={avatarHandle} />
          </li>
          <li>
            <label>Retweet</label>
            <input
              type="number"
              className="input"
              value={retweet}
              onChange={(e) => setRetweet(e.target.value)}
            />
          </li>
          <li>
            <label>{langText.quote}</label>
            <input
              type="number"
              className="input"
              value={quoteTweets}
              onChange={(e) => setQuoteTweets(e.target.value)}
            />
          </li>
          <li>
            <label>{langText.like}</label>
            <input
              type="number"
              className="input"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label>{langText.verified}</label>
            <select
              onChange={(e) => setVerified(e.target.value)}
              defaultValue={verified}
            >
              <option value="1">Evet</option>
              <option value="0">Hayır</option>
            </select>
          </li>
          <button onClick={getImage}>{langText.createBtn}</button>
          <div className="download-url">
            {image && (
              <a ref={downloadRef} href={image} download="tweet.png">
                Tweeti İndir
              </a>
            )}
          </div>
        </ul>
      </div>

      <div className="tweet-container">
        <div className="app-lang">
          <span
            className={lang === "tr" && "active"}
            onClick={() => setLang("tr")}
          >
            Türkçe
          </span>
          <span
            className={lang === "en" && "active"}
            onClick={() => setLang("en")}
          >
            English
          </span>
        </div>

        <div className="fetch-info">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Twitter Kullanıcı Adını Gir"
          />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
        </div>

        <div className="tweet" ref={tweetRef}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} alt="" />) || <AvatarLoader />}
            <div>
              <div className="name">
                {name || "Ad Soyad"}
                {verified == 1 && (
                  <VerifiedIcon width="19" height="19" color="#fff" />
                )}
              </div>
              <div className="username">@{username || "kullaniciadi"}</div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  (tweet && tweetFormat(tweet)) ||
                  "Burası tweet içeriği alanıdır.",
              }}
            ></p>
          </div>
          <div className="tweet-stats">
            <span>
              <strong>{formatNumber(retweet)}</strong> Retweet
            </span>
            <span>
              <strong>{formatNumber(quoteTweets)}</strong> Alıntı Tweetler
            </span>
            <span>
              <strong>{formatNumber(likes)}</strong> Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon color="#6e767d" />
            </span>
            <span>
              <RetweetIcon color="#6e767d" />
            </span>
            <span>
              <LikeIcon color="#6e767d" />
            </span>
            <span>
              <ShareIcon color="#6e767d" />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

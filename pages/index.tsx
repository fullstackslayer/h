import Head from "next/head";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import getWeather from "../utils/getWeather";
import { TimeWidget } from "../components/TimeWidget";
import { WeatherWidget } from "../components/WeatherWidget";
import { loadingWeatherObj } from "../constants/loadingWeatherObj";

interface Parameters {
  title?: string;
  pinned?: string;
  background?: string;
  unit?: "C" | "F";
}

interface BookmarkObj {
  url: string;
  image: string;
  name: string;
}

const mainVariants = {
  init: {
    opacity: 0,
  },
  load: {
    opacity: 1,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
      staggerChildren: 0.15,
    },
  },
};

const mainChildVariants = {
  init: {
    opacity: 0,
    scale: 0.95,
  },
  load: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0, 0.65, 0.8, 1],
    },
  },
};

export default function Home() {
  const router = useRouter();
  let params: Parameters = router.query;

  let [pinnedLinks, setPinnedLinks] = useState([
    {
      name: "GitHub Repo",
      url: "https://github.com/cnrad/h.cnrad.dev",
      image:
        "https://www.macobserver.com/wp-content/uploads/2019/05/workfeatured-GitHub-2.png",
    },
  ]);

  let [title, setTitle] = useState("New Tab");
  let [background, setBackground] = useState("none");
  // let [userIp, setUserIp] = useState("IP not found");
  let [weatherObj, setWeatherObj] = useState(loadingWeatherObj);
  let [time, setTime] = useState("00:00:00 p.m.");
  let [temperatureUnit, setTemperatureUnit] = useState("F");

  function getTime() {
    let current = new Date().toLocaleString("en-US");
    setTime(current.toLowerCase().slice(-11, -1) + ".m.");
    setTimeout(getTime, 1000);
  }

  useEffect(() => {
    const main = async () => {
      if (!params.pinned) return;

      await fetch(`/api/fetchData?url=${params.pinned}`)
        .then((res: any) => res.json())
        .then((data: any) => setPinnedLinks(JSON.parse(data.body)));
    };
    main();

    if (params.title) setTitle(params.title);
    if (params.background) setBackground(params.background);

    params.unit?.toUpperCase() == "C"
      ? setTemperatureUnit("C")
      : setTemperatureUnit("F");
  }, [router.isReady]);

  useEffect(() => {
    (async function () {
      let currentWeather = await getWeather();
      setWeatherObj(currentWeather);
    })();

    getTime();
  }, []);

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <>
      <Head>
        <title>{title} - h.cnrad.dev</title>
      </Head>

      <div className="bg-[#000] fixed inset-0 w-full h-full outline-none border-none flex items-center justify-center flex-col-reverse overflow-y-scroll lg:flex-row lg:overflow-hidden">
        <Widgets initial="init" animate="load" variants={mainVariants}>
          <TimeWidget time={time} />
          <WeatherWidget time={time} />
        </Widgets>

        <Main initial="init" animate="load" variants={mainVariants}>
          <Header variants={mainChildVariants}>
            {title}{" "}
            <span
              style={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 400 }}
            >
              - h.cnrad.dev
            </span>
          </Header>
          <Search variants={mainChildVariants}>
            <SearchInput
              placeholder="Search or enter address"
              onChange={(e) => {
                e.target.value;
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  (event.target as HTMLInputElement).value.startsWith(
                    "https://"
                  )
                )
                  return router.push((event.target as HTMLInputElement).value);
                if (event.key === "Enter")
                  return router.push(
                    `https://search.balls.workers.dev/?q=${
                      (event.target as HTMLInputElement).value
                    }`
                  );
              }}
            />
          </Search>

          <PinnedSites variants={mainChildVariants}>
            {pinnedLinks.map((linkObj: BookmarkObj) => {
              return (
                <Site href={linkObj.url} key={linkObj.url} target="_blank">
                  <SiteIcon image={linkObj.image} />
                  <SiteName>{linkObj.name}</SiteName>
                </Site>
              );
            })}
          </PinnedSites>
        </Main>

        <Background bgParam={background} />
      </div>
    </>
  );
}

const Background = styled(motion.div)<{ bgParam: string }>`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;

  background: ${({ bgParam }) =>
    bgParam === "none"
      ? "#2B2A33"
      : bgParam.startsWith("http")
      ? `url(${bgParam})`
      : bgParam};
  background-size: cover;
  background-position: 50% 50%;
  ${({ bgParam }) =>
    bgParam.startsWith("http") ? `filter: brightness(30%);` : ``};

  outline: none;
  border: none;
  opacity: 1;
  z-index: -10;
`;

const Page = styled.div`
  background: #000;
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  outline: none;
  border: none;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;

  @media (max-width: 1000px) {
    flex-direction: column-reverse;
    overflow-y: scroll;
  }
`;

const Widgets = styled(motion.div)`
  width: 50%;
  height: 100%;
  margin: 3rem;

  display: flex;
  align-items: end;
  justify-content: center;
  flex-direction: column;

  @media (max-width: 1000px) {
    align-items: center;
    justify-content: start;
    margin: 0 3rem;
  }
`;

const Main = styled(motion.div)`
  width: 50%;
  height: 100%;
  margin: 3rem;

  display: flex;
  align-items: start;
  justify-content: center;
  flex-direction: column;

  @media (max-width: 1000px) {
    width: 70%;
    align-items: center;
    margin: 0 3rem;
  }
`;

const Header = styled(motion.h1)`
  font-size: 2.25rem;
  font-family: "Poppins";
  font-weight: 600;
  color: #fff;

  @media (max-width: 1000px) {
    text-align: center;
  }
`;

const Search = styled(motion.div)`
  width: 70%;
  min-height: 52px;
  min-width: 25rem;
  background: #38383d url("/icons/searchGlass.svg") 16px center no-repeat;
  border-radius: 7px;

  display: flex;
  align-items: center;
  justify-content: start;
  flex-direction: row;
  transition: all 0.15s ease-in-out;

  box-shadow: 0 2px 6px rgba(28, 27, 34, 0.5);

  @media (max-width: 1000px) {
    width: 100%;
    min-width: 20rem;
  }
`;

const SearchInput = styled.input`
  background: transparent;
  height: 100%;
  width: 100%;
  font-size: 1rem;
  font-family: "Poppins";
  font-weight: 400;
  color: #b1b1bd;
  outline: none;
  border: none;
  margin-left: 55px;
`;

const PinnedSites = styled(motion.div)`
  padding: 48px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: start;
  width: 75%;

  @media (max-width: 1000px) {
    justify-content: center;
    padding: 48px 0 24px 0;
    width: 80vw;
  }
`;

const Site = styled.a`
  width: 100px;
  height: 125px;
  background: rgba(0, 0, 0, 0);
  border-radius: 10px;
  transition: all 0.15s ease-in-out;
  margin: 0 20px 0 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;

  &:hover {
    background: #3b3a43;
  }
`;

const SiteIcon = styled.div<{ image: string }>`
  margin-top: 13px;
  margin-bottom: 7px;
  width: 75px;
  height: 75px;
  border-radius: 10px;

  background: url(${({ image }) => image});
  background-size: cover;
  background-position: 50% 50%;
`;

const SiteName = styled.div`
  font-size: 0.75rem;
  color: #fff;
  width: 80px;
  max-height: 2rem;
  white-space: nowrap;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Temp = styled.div`
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
`;

const WeatherDescription = styled.div`
  color: #fff;
  font-size: 1.25rem;
  font-weight: 500;
  width: 16rem;
`;

const WeatherIcon = styled.img`
  margin-right: 10px;
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 0 5px #fff);
`;

const TimeSubtitle = styled.div`
  color: #fff;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: 0.035rem;
`;

const Time = styled.div`
  color: #fff;
  font-size: 1.35rem;
  font-weight: 300;

  width: 20rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
`;

const AmPm = styled.div`
  margin-left: 0.5rem;
  color: #e6e6e6;
  font-size: 1.2rem;
  font-weight: 300;
`;

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { ReactElement } from 'react';
import { useRecoilValue } from 'recoil';
import { currentTimeAtom, percentageAtom, songDataState, totalTimeAtom } from 'states';
import { PlayerProps } from 'types';
interface ProgressStyledProps {
  percentage: number;
}

function MobilePlayerTop({
  handleSeekTime,
  handleBackTime,
  handleForwardTime,
}: PlayerProps): ReactElement {
  const data = useRecoilValue(songDataState);
  const albumImageUrl = data?.albumImageUrl;
  const currentTime = useRecoilValue<number>(currentTimeAtom);
  const totalTime = useRecoilValue<number>(totalTimeAtom);
  const percentage = useRecoilValue<number>(percentageAtom);
  const title = data?.title;
  const artist = data?.artist;
  const currentTimeForm =
    currentTime % 60 <= 9
      ? `0${Math.floor(currentTime / 60)}:0${Math.floor(currentTime) % 60} `
      : `0${Math.floor(currentTime / 60)}:${Math.floor(currentTime) % 60} `;

  const finishedTime =
    totalTime % 60 <= 9
      ? `0${Math.floor(totalTime / 60)}:0${totalTime % 60} `
      : `0${Math.floor(totalTime / 60)}:${totalTime % 60} `;

  return (
    <Styled.Root>
      <img className="player-album" src={albumImageUrl} alt="albumImage" />
      <Styled.Player>
        <Styled.Title>
          {title}-{artist}
        </Styled.Title>
        <Styled.Progress percentage={percentage}>
          <div className="time__current">{currentTimeForm}</div>
          <input
            className="bar"
            type="range"
            min={0}
            max={totalTime}
            value={currentTime}
            onInput={handleSeekTime}
          />
          <div className="time__end">{finishedTime}</div>
        </Styled.Progress>
      </Styled.Player>
    </Styled.Root>
  );
}

export default MobilePlayerTop;

const Styled = {
  Root: styled.div`
    display: flex;
    align-items: center;
    align-items: center;
    justify-content: space-evenly;
    background: url('/assets/images/MobileTopPlayer.svg') no-repeat 0 0;
    background-size: cover;
    width: 100%;
    height: 100px;
    /* only Chrome */
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      width: 16px;
      height: 16px;
    }

    input[type='range']:focus {
      outline: none;
    }
    .player-album {
      width: 61px;
      height: 61px;
    }
  `,
  Player: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 67%;
    height: 45px;
  `,
  Title: styled.div`
    margin-bottom: 10px;
    text-align: center;
    color: #ffffff;
    font-family: Noto Sans;
    font-size: 15px;
    font-weight: bold;
    font-style: normal;
  `,
  Progress: styled.div<ProgressStyledProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 14px;
    .bar {
      -webkit-appearance: none;
      align-self: center;
      margin-right: 10px;
      /* margin-bottom: 5px; */
      margin-left: 10px;
      border-radius: 10px;
      background-color: #9d9d9d;
      width: 72%;
      height: 3px;
      ${({ percentage }) => css`
        background: linear-gradient(
          to right,
          #ffffff 0%,
          #ffffff ${percentage}%,
          #9d9d9d ${percentage}%,
          #9d9d9d 100%
        );
      `}
    }
    .time__current {
      height: 14px;
      color: #e1e1e1;
      font-family: Roboto;
      font-size: 12px;
    }
    .time__end {
      height: 14px;
      color: #e1e1e1;
      font-family: Roboto;
      font-size: 12px;
    }
  `,
};

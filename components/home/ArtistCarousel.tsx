import styled from '@emotion/styled';
import React, { ReactElement } from 'react';

import ArtistCard from './ArtistCard';
import NewSongCard from './NewSongCard';

function ArtistCarousel(): ReactElement {
  return (
    <Wrap>
      <ArtistCard
        name={'BTS'}
        profileImage={
          'https://img0.yna.co.kr/etc/inner/EN/2021/06/16/AEN20210616005400315_01_i_P2.jpg'
        }
        logo={'https://1000logos.net/wp-content/uploads/2018/03/BTS_Logo.png'}
      />
      <ArtistCard
        name={'BTS'}
        profileImage={
          'https://img0.yna.co.kr/etc/inner/EN/2021/06/16/AEN20210616005400315_01_i_P2.jpg'
        }
        logo={'https://1000logos.net/wp-content/uploads/2018/03/BTS_Logo.png'}
      />
      <NewSongCard />
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  position: absolute;
  justify-content: space-between;
  margin-right: 140px;
  margin-left: 140px;
  width: 1160px;
  height: 270px;
`;

export default ArtistCarousel;

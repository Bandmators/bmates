'use client';

import styled from '@emotion/styled';

import { maxMedia } from '@/libs/media';

import { Container } from '../common/grid/Container';

export default function Footer() {
  return (
    <FooterStyle>
      <FooterNavBar>
        <p className="name">BMates</p>
        <p className="email">kyechan99@gmail.com</p>
      </FooterNavBar>
    </FooterStyle>
  );
}
const FooterStyle = styled.footer`
  margin-top: 10rem;
  border-top: 1px solid var(--hr);
`;
const FooterNavBar = styled(Container)`
  padding: 3rem 0rem;
  a {
    color: #a2a3a0;
  }
  .row {
    align-items: center;
    gap: 0px;
    ${maxMedia.tablet} {
      gap: 1rem;
      flex-direction: column;
      align-items: center;
    }
  }
  .col-0 {
    .name {
      font-weight: 500;
      font-size: 22px;
      margin: 0px;
      color: #a2a3a0;
    }
    .email {
      font-size: 14px;
      margin: 0px;
      color: #a2a3a0;
    }
  }
  .col-1 {
    display: flex;
    justify-content: center;
  }
  .col-2 {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    ${maxMedia.tablet} {
      justify-content: center;
    }
  }
`;

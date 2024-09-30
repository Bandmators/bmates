'use client';

import styled from '@emotion/styled';

import { maxMedia } from '@/libs/media';

// export default function Navbar() {
//     return (

//     )
// }
export const Navbar = styled.header`
  top: 0px;
  background: var(--white);
  width: 100%;
  position: sticky;
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  justify-content: space-between;

  height: var(--layoutHeader);
  border-bottom: 1px solid var(--gray-200);
  z-index: 1;

  padding: 12px 16px;

  ${maxMedia.mobile} {
    padding: 0rem;
  }
`;

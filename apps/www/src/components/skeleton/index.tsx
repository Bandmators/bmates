'use client';

import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import clsx from 'clsx';
import React from 'react';

export interface SkeletonProps extends React.ComponentProps<'div'> {
  /**
   * 애니메이션 활성화 여부
   */
  $animation?: boolean;
  /**
   * Height
   */
  height?: string;
  /**
   * Width
   */
  width?: string;
  /**
   * 타입
   */
  $variant?: 'circle' | 'rect' | 'rounded';
  /**
   * 상세 스타일
   */
  $borderRadius?: string;
}

export default function Skeleton({
  $animation = true,
  children,
  className,
  height,
  width,
  $borderRadius,
  $variant = 'rect',
}: SkeletonProps) {
  return (
    <SkeletonStyled
      className={clsx('skeleton', className)}
      $animation={$animation}
      $variant={$variant}
      $borderRadius={$borderRadius}
      style={{ height, width }}
    >
      {children}
    </SkeletonStyled>
  );
}

const pulse = keyframes`
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
    100% {
        opacity: 1;
    }
`;

const skeletonStyles = css`
  background-color: rgba(0, 0, 0, 0.05);
  display: inline-block;
  height: auto;
  width: 100%;
`;

const skeletonAnimation = css`
  animation: ${pulse} 1.5s ease-in-out 0.5s infinite;
`;

const VARIANTS = {
  rect: css`
    border-radius: 0.25rem;
  `,
  circle: css`
    border-radius: 50%;
  `,
  rounded: css`
    border-radius: 0.5rem;
  `,
};

const SkeletonStyled = styled.span<SkeletonProps>`
  ${skeletonStyles}

  ${props => props.$animation && skeletonAnimation} 

  ${props => props.$variant && VARIANTS[props.$variant]}

  ${props =>
    props.$borderRadius &&
    css`
      border-radius: ${props.$borderRadius};
    `}
`;

type SkeletonGroupProps = {
  $align?: string;
};
export const SkeletonGroup = styled.div<SkeletonGroupProps>`
  display: inline-flex;
  flex-direction: column;
  ${props =>
    props.$align &&
    css`
      align-items: ${props.$align};
    `}
`;

type SkeletonWrapperProps = {
  $align?: string;
  $overflow?: boolean;
};
export const SkeletonWrapper = styled.div<SkeletonWrapperProps>`
  display: flex;
  ${props =>
    props.$overflow &&
    css`
      overflow: hidden;
    `}
`;

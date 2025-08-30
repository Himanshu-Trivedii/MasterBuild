import { DemoResponse } from "@shared/api";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

// Define keyframes for animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const ping = keyframes`
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const pulse = keyframes`
  50% {
    opacity: 0.5;
  }
`;

// Styled components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    hsl(210 40% 98%),
    hsl(217 91% 95%),
    hsl(221 83% 92%)
  );
  position: relative;
  overflow: hidden;

  .dark & {
    background: linear-gradient(
      135deg,
      hsl(222 84% 5%),
      hsl(217 91% 10%),
      hsl(221 83% 12%)
    );
  }
`;

const BackgroundElements = styled.div`
  position: absolute;
  inset: 0;
`;

const FloatingElement1 = styled.div`
  position: absolute;
  top: 5rem;
  left: 5rem;
  width: 8rem;
  height: 8rem;
  background: linear-gradient(
    135deg,
    hsl(217 91% 60% / 0.15),
    hsl(271 91% 65% / 0.15)
  );
  border-radius: 50%;
  filter: blur(32px);
  animation: ${float} 3s ease-in-out infinite;
`;

const FloatingElement2 = styled.div`
  position: absolute;
  top: 10rem;
  right: 5rem;
  width: 6rem;
  height: 6rem;
  background: linear-gradient(
    135deg,
    hsl(196 100% 60% / 0.2),
    hsl(221 83% 65% / 0.2)
  );
  border-radius: 50%;
  filter: blur(24px);
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: 1s;
`;

const FloatingElement3 = styled.div`
  position: absolute;
  bottom: 8rem;
  left: 8rem;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(
    135deg,
    hsl(271 91% 65% / 0.15),
    hsl(314 100% 75% / 0.15)
  );
  border-radius: 50%;
  filter: blur(16px);
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: 2s;
`;

const GeometricAccent1 = styled.div`
  position: absolute;
  top: 25%;
  left: 25%;
  width: 0.25rem;
  height: 3rem;
  background: linear-gradient(to bottom, hsl(217 91% 60% / 0.3), transparent);
  transform: rotate(12deg);
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const GeometricAccent2 = styled.div`
  position: absolute;
  bottom: 25%;
  right: 25%;
  width: 3rem;
  height: 0.25rem;
  background: linear-gradient(to right, hsl(271 91% 60% / 0.3), transparent);
  transform: rotate(-12deg);
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 1s;
`;

const ContentContainer = styled.div`
  text-align: center;
  position: relative;
  z-index: 10;
`;

const Card = styled.div`
  display: inline-block;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: transform 700ms cubic-bezier(0.4, 0, 0.2, 1);

  .dark & {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(51, 65, 85, 0.5);
  }

  &:hover {
    transform: scale(1.05);
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  background: linear-gradient(
    to right,
    hsl(217 91% 60%),
    hsl(271 91% 65%),
    hsl(221 83% 60%)
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;

  .dark & {
    background: linear-gradient(
      to right,
      hsl(217 91% 65%),
      hsl(271 91% 70%),
      hsl(221 83% 65%)
    );
    background-clip: text;
    -webkit-background-clip: text;
  }
`;

const IconContainer = styled.div`
  position: relative;
`;

const SpinningIcon = styled.svg`
  height: 2.5rem;
  width: 2.5rem;
  color: hsl(217 91% 60%);
  animation: ${spin} 1s linear infinite;
`;

const SpinningCircle1 = styled.circle`
  opacity: 0.2;
`;

const SpinningCircle2 = styled.circle`
  color: hsl(271 91% 60%);
`;

const PingEffect = styled.div`
  position: absolute;
  inset: 0;
  animation: ${ping} 1s cubic-bezier(0, 0, 0.2, 1) infinite;

  div {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(
      to right,
      hsl(217 91% 65% / 0.3),
      hsl(271 91% 65% / 0.3)
    );
  }
`;

const NotificationCard = styled.div`
  margin-top: 1.5rem;
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.4);

  .dark & {
    background: rgba(51, 65, 85, 0.7);
    border-color: rgba(51, 65, 85, 0.4);
  }
`;

const NotificationText = styled.p`
  color: hsl(210 40% 28%);
  max-width: 28rem;
  font-weight: 500;
  margin: 0;

  .dark & {
    color: hsl(210 40% 78%);
  }
`;

const HiddenText = styled.p`
  margin-top: 1rem;
  max-width: 28rem;
  display: none;
`;

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");

  // Fetch users on component mount
  useEffect(() => {
    fetchDemo();
  }, []);

  // Example of how to fetch data from the server (if needed)
  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      const data = (await response.json()) as DemoResponse;
      setExampleFromServer(data.message);
    } catch (error) {
      console.error("Error fetching hello:", error);
    }
  };

  return (
    <Container>
      {/* Floating background elements */}
      <BackgroundElements>
        <FloatingElement1 />
        <FloatingElement2 />
        <FloatingElement3 />

        {/* Geometric accents */}
        <GeometricAccent1 />
        <GeometricAccent2 />
      </BackgroundElements>

      <ContentContainer>
        <Card>
          <Title>
            <IconContainer>
              <SpinningIcon viewBox="0 0 50 50">
                <SpinningCircle1
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <SpinningCircle2
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="100"
                  strokeDashoffset="75"
                />
              </SpinningIcon>
              <PingEffect>
                <div />
              </PingEffect>
            </IconContainer>
            Generating your app...
          </Title>
        </Card>
        <NotificationCard>
          <NotificationText>
            Watch the chat on the left for updates that might need your
            attention to finish generating
          </NotificationText>
        </NotificationCard>
        <HiddenText>{exampleFromServer}</HiddenText>
      </ContentContainer>
    </Container>
  );
}

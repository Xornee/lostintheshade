import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 5px 20px;
  font-size: 4rem;
  border-radius: 20px;
  border: none;
  background-color: black;
  letter-spacing: -5px;
  color: var(--secondary-text);
  cursor: pointer;
`;
export const StyledRoundButton = styled.button`
  padding: 15px;
  border: none;
  background-color: black;
  font-weight: bold;
  font-size: 30px;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;
export const StyledH1 = styled.h1`
  font-size: 7rem;
  font-weight: bold;
  letter-spacing: -3px;
`;
export const StyledImg = styled.img`
  width: 200px;
  @media (min-width: 900px) {
    width: 400px;
  }
  @media (min-width: 1000px) {
    width: 600px;
  }
  @media (min-width: 1930px) {
    width: 900px;
  }
  transition: width 0.5s;
`;
export const MainContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  text-align: center;
  @media (min-width: 700px) {
    margin-left: 0px;
    margin-right: 0px;
  }
  @media (min-width: 900px) {
    margin-left: 100px;
    margin-right: 100px;
  }
  @media (min-width: 1930px) {
    margin-left: 200px;
    margin-right: 200px;
  }
`;
export const SupplyNumber = styled.div`
  -webkit-text-stroke: 1px black;
  font-weight: bold;
  font-size: 5rem;
  font-weight: bold;
  letter-spacing: -3px;
`;
export const Icons = styled.a`
    background-color: grey;
    height: 50px;
    width: 50px;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    transition: ease-in-out all 0.2s;
    margin: 0px 30px;
`;
export const MainWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    z-index: 10000;
`;
export const GeneralText = styled.p`
  color: grey !important;
  font-size: 1.5rem;
  font-weight: bold;
`;
export const PlayAudio = styled.iframe`
  position: absolute;
`;


function App() {
  const dispatch = useDispatch();
  const [showNumbers, setShowNumbers] = useState(false);
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);

    
    let totalGasLimit = String(gasLimit * ( mintAmount * 0.08));
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .Mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
      if (newMintAmount > 4) {
        newMintAmount = 4;
      }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
      setShowNumbers(true);
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <video autoPlay muted loop id="myVideo"
        style={{ position: "fixed",
          right:"0",
          bottom: "0",
          minWidth: "100%",
          minHeight: "100%",}}
      >
        <source src="/config/images/bg.mp4" type="video/mp4"></source>
      </video>
      <MainWrapper
        flex={1}
        ai={"center"}
        fd={"column"}
      >
        <s.Container flex={'1'} jc={"center"} ai={"center"} style={{ width: "100%"}} fd={"column"}>
          <StyledImg
            style={{ width: "300px" ,marginTop: "20px" }}
            alt={"example"}
            src={"/config/images/shade1.png"}
          />
          <StyledImg
            style={{ width: "350px", marginTop: "20px"  }}
            alt={"example"}
            src={"/config/images/shade2.png"}
          />
        </s.Container>
        <s.Container flex={'1'} jc={"center"} ai={"center"} style={{ width: "70%", marginTop: "11%" }} fd={"column"}>
            <s.SpacerXSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <GeneralText
                >
                  The sale has ended.
                </GeneralText>
              </>
            ) : (
              <>
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                        setShowNumbers(true);
                      }}
                    >
                        <StyledImg
                          style={{ width: "250px", marginBottom: "10px"}}
                          alt={"example"}
                          src={"/config/images/text2.png"}
                        />
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                          {claimingNft ? (
                              <StyledImg
                                style={{ width: "250px", marginBottom: "10px" }}
                                alt={"example"}
                                src={"/config/images/text3.png"} 
                              />
                            ) : (
                              <StyledImg
                                style={{ width: "250px", marginBottom: "10px" }}
                                alt={"example"}
                                src={"/config/images/text1.png"}
                              />
                          )}
                      </StyledButton>
                    </s.Container>
                          <s.SpacerMedium />
                          <s.Container ai={"center"} jc={"center"} fd={"row"}>
                            <StyledRoundButton
                              style={{ lineHeight: 0.4 }}
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                decrementMintAmount();
                              }}
                            >
                              -
                            </StyledRoundButton>
                            <s.SpacerMedium />
                            <s.TextDescription
                              style={{
                                textAlign: "center",
                                color: "var(--accent-text)",
                              }}
                            >
                              {mintAmount}
                            </s.TextDescription>
                            <s.SpacerMedium />
                            <StyledRoundButton
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                incrementMintAmount();
                              }}
                            >
                              +
                            </StyledRoundButton>
                          </s.Container>
                      
                  </>
                )}
                    <s.SpacerSmall />
                    <s.SpacerSmall />
              </>
              
            )}
        </s.Container>
        <s.SpacerSmall />
        <s.Container flex={'1'} jc={"center"} ai={"center"} style={{ width: "70%" }} fd={"row"}>
          {showNumbers == true ? (
            <GeneralText
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </GeneralText>

          ) : (
            <>
            </>
          )}
        </s.Container>
        <s.SpacerSmall />
        <s.Container flex={'1'} jc={"center"} ai={"center"} style={{ width: "70%", marginTop: "180px" }} fd={"row"}>
          <Icons href="https://twitter.com/LostInTheShade" class="black-icon" target="_blank"><img style={{ height: 35 }} src="/config/images/twitter.png" alt="twitter icon" class="twitter-icon"></img></Icons>
          <Icons href="https://opensea.io/collection/lost-in-the-shade" class="black-icon" target="_blank"><img style={{ height: 50 }} src="/config/images/opensea.png" alt="opensea icon" class="opensea"></img></Icons>
          <Icons href="https://etherscan.io/address/0x772ce560C77708172D1cB4d7B5233C460302C60d#code" class="black-icon" target="_blank"><img style={{ height: 40}} src="/config/images/ethereum.png" alt="ethereum icon" class="ethereum-icon"></img></Icons>
        </s.Container>
      </MainWrapper>
      <PlayAudio>
        <audio autoPlay controls loop>
          <source src="/config/sound.mp3" type="audio/mpeg"></source>
          <source src="/config/sound.ogg" type="audio/ogg"></source>
        </audio>
      </PlayAudio>
    </s.Screen>
  );
}

export default App;

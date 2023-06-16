import React from "react";
import { useAuth } from "react-oidc-context";
import Header from "../src/components/Header";
import PageSection from "../src/components/PageSection";

import { FiRepeat } from "react-icons/fi";
import { MdGroups } from "react-icons/md";
import { BsCalendar2Week } from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { HiOutlineDocumentMagnifyingGlass } from "react-icons/hi2";
import Button from "../src/components/Button";

const Index = () => {
  const auth = useAuth();
  const tiers = [
    { colour: "bg-red-400", numberFlashcards: 25 },
    { colour: "bg-orange-300", numberFlashcards: 15 },
    { colour: "bg-yellow-300", numberFlashcards: 5 },
    { colour: "bg-lime-300", numberFlashcards: 20 },
    { colour: "bg-green-300", numberFlashcards: 30 },
  ];

  // TODO: refactor
  return (
    <div className="w-full h-full flex grow flex-col p-4 space-y-4">
      {auth.isAuthenticated ? (
        <>
          <Header>
            Welcome back {auth.user?.profile.given_name ?? "Unknown"}!
          </Header>
          <div className="grid grid-cols-7 h-full w-full space-x-4">
            <PageSection
              className="col-span-3"
              titleBar="Jump back in..."
            ></PageSection>
            <div className="grid grid-rows-2 col-span-4 space-y-4">
              <div className="grid grid-cols-2 span-4 space-x-4">
                <PageSection
                  titleBar="Spaced Repetition"
                  icon={<FiRepeat size={18} className="text-gray-800" />}
                  bgIcon={<FiRepeat size={200} />}
                >
                  <div className="flex flex-col grow justify-between items-center">
                    <div className="w-full space-y-1">
                      {tiers.map((tier, i) => {
                        const priority = ((i + 1) * 751391) % 25;
                        return (
                          <div
                            key={`tier-${i + 1}`}
                            className="flex flex-row grow justify-between items-center"
                          >
                            <div className="flex flex-row items-center space-x-2">
                              <div
                                className={`aspect-square h-4 w-4 rounded-lg ${tier.colour}`}
                              />
                              <p>Tier {i + 1}</p>
                            </div>
                            <div className="flex flex-row space-x-2">
                              <div className="flex flex-row items-center space-x-1">
                                <BiCopy className="text-gray-800" />
                                <p className={`aspect-square w-6`}>
                                  {priority}
                                </p>
                              </div>
                              <button>
                                <HiOutlineDocumentMagnifyingGlass
                                  size={20}
                                  className="text-gray-800"
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button>Review All</Button>
                  </div>
                </PageSection>
                <PageSection
                  titleBar="Groups"
                  icon={
                    <MdGroups
                      size={28}
                      className="text-gray-800 space-x-4 space-y-4"
                    />
                  }
                  bgIcon={<MdGroups size={200} />}
                ></PageSection>
              </div>
              <PageSection
                titleBar="Calendar"
                icon={
                  <BsCalendar2Week
                    size={28}
                    className="text-gray-800"
                    strokeWidth={0.2}
                  />
                }
                bgIcon={<BsCalendar2Week size={200} />}
              ></PageSection>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center pt-10">Please login to view this page</div>
      )}
    </div>
  );
};

export default Index;

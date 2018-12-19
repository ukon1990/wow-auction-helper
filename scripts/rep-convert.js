function convert(input) {
  const reps = input['ReputationRecipes'];
  const list [];
  Object.keys(reps).forEach(name => list.push(getRepData(name, reps[name])));
  return list;
}

function getRepData(name, repData) {
  const rep = {
    id: 0,
    name: name,
    isAlly: repData.IsAlly,
    isHorde: repData.IsHorde,
  };
  return rep;
}


console.log(convert({"ReputationRecipes": {
    "Tortollan Seekers": {
      "IsAlly": true,
      "IsHorde": true,
      "Vendor": {
        "Collector Kojo": {
          "IsAlly": true,
          "IsHorde": true,
          "Location": {
            "1": {
              "NpcID": "134345",
              "Zone": "Zuldazar",
              "Location": "71.4, 30.2"
            },
            "2": {
              "NpcID": "135793",
              "Zone": "Stormsong Valley",
              "Location": "40.51, 36.49"
            }
          }
        }
      },
      "Professions": {
        "Alchemy": {
          "Recipe: Endless Tincture of Renewed Combat (Rank 3)": {
            "ItemID": "162136",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Endless Tincture of Renewed Combat",
              "Rank": "3",
              "SpellID": "252363",
              "Materials": {
                "Siren's Pollen": {
                  "ItemID": "152509",
                  "Qty": "18"
                },
                "Riverbud": {
                  "ItemID": "152505",
                  "Qty": "18"
                },
                "Expulsom": {
                  "ItemID": "152668",
                  "Qty": "1"
                },
                "Crystal Vial": {
                  "ItemID": "3371",
                  "Qty": "1"
                }
              }
            }
          },
          "Recipe: Siren's Alchemist Stone (Rank 3)": {
            "ItemID": "162137",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Siren's Alchemist Stone",
              "Rank": "3",
              "SpellID": "252370",
              "Materials": {
                "Sea Stalk": {
                  "ItemID": "152511",
                  "Qty": "18"
                },
                "Star Moss": {
                  "ItemID": "152506",
                  "Qty": "18"
                },
                "Expulsom": {
                  "ItemID": "152668",
                  "Qty": "18"
                }
              }
            }
          }
        },
        "Cooking": {
          "Recipe: Bountiful Captains Feast (Rank 2)": {
            "ItemID": "162288",
            "ReputationLevel": "Honored",
            "Cost": [
              1100,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Bountiful Captains Feast",
              "Rank": "2",
              "SpellID": "259423",
              "Materials": {
                "Redtail Loach": {
                  "ItemID": "152549",
                  "Qty": "18"
                },
                "Frenzied Fangtooth": {
                  "ItemID": "152545",
                  "Qty": "18"
                },
                "Stringy Loins": {
                  "ItemID": "154897",
                  "Qty": "18"
                },
                "Meaty Haunch": {
                  "ItemID": "154898",
                  "Qty": "18"
                },
                "Kul Tiramisu": {
                  "ItemID": "154881",
                  "Qty": "11"
                },
                "Mon'Dazi": {
                  "ItemID": "154885",
                  "Qty": "11"
                },
                "Midnight Salmon": {
                  "ItemID": "162515",
                  "Qty": "5"
                }
              }
            }
          },
          "Recipe: Bountiful Captains Feast (Rank 3)": {
            "ItemID": "162289",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Bountiful Captains Feast",
              "Rank": "3",
              "SpellID": "259423",
              "Materials": {
                "Redtail Loach": {
                  "ItemID": "152549",
                  "Qty": "15"
                },
                "Frenzied Fangtooth": {
                  "ItemID": "152545",
                  "Qty": "15"
                },
                "Stringy Loins": {
                  "ItemID": "154897",
                  "Qty": "15"
                },
                "Meaty Haunch": {
                  "ItemID": "154898",
                  "Qty": "15"
                },
                "Kul Tiramisu": {
                  "ItemID": "154881",
                  "Qty": "10"
                },
                "Mon'Dazi": {
                  "ItemID": "154885",
                  "Qty": "10"
                },
                "Midnight Salmon": {
                  "ItemID": "162515",
                  "Qty": "5"
                }
              }
            }
          },
          "Recipe: Galley Banquet (Rank 3)": {
            "ItemID": "162287",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Galley Banquet",
              "Rank": "3",
              "SpellID": "259420",
              "Materials": {
                "Briny Flesh": {
                  "ItemID": "152631",
                  "Qty": "8"
                },
                "Thick Paleo Steak": {
                  "ItemID": "154899",
                  "Qty": "8"
                },
                "Sand Shifter": {
                  "ItemID": "152543",
                  "Qty": "8"
                },
                "Tiragarde Perch": {
                  "ItemID": "152548",
                  "Qty": "8"
                },
                "Foosaka": {
                  "ItemID": "160400",
                  "Qty": "10"
                },
                "Fresh Potato": {
                  "ItemID": "160709",
                  "Qty": "25"
                },
                "Midnight Salmon": {
                  "ItemID": "162515",
                  "Qty": "2"
                }
              }
            }
          },
          "Recipe: Grilled Catfish (Rank 3)": {
            "ItemID": "162292",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Grilled Catfish",
              "Rank": "3",
              "SpellID": "259432",
              "Materials": {
                "Great Sea Catfish": {
                  "ItemID": "152547",
                  "Qty": "5"
                }
              }
            }
          },
          "Recipe: Seasoned Loins (Rank 3)": {
            "ItemID": "162293",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Seasoned Loins",
              "Rank": "3",
              "SpellID": "259435",
              "Materials": {
                "Stringy Loins": {
                  "ItemID": "154897",
                  "Qty": "10"
                },
                "Foosaka": {
                  "ItemID": "160400",
                  "Qty": "5"
                }
              }
            }
          }
        },
        "Enchanting": {
          "Formula: Enchant Ring - Seal of Critical Strike (Rank 3)": {
            "ItemID": "162298",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Seal of Critical Strike",
              "Rank": "3",
              "SpellID": "255094",
              "Materials": {
                "Gloom Dust": {
                  "ItemID": "152875",
                  "Qty": "8"
                }
              }
            }
          },
          "Formula: Enchant Ring - Seal of Versatility (Rank 3)": {
            "ItemID": "162301",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Seal of Versatility",
              "Rank": "3",
              "SpellID": "256298",
              "Materials": {
                "Gloom Dust": {
                  "ItemID": "152875",
                  "Qty": "8"
                }
              }
            }
          }
        },
        "Inscription": {
          "Recipe: Contract: Champions of Azeroth (Rank 2)": {
            "ItemID": "162373",
            "ReputationLevel": "Honored",
            "Cost": [
              1100,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Contract: Champions of Azeroth",
              "Rank": "2",
              "SpellID": "256298",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "1"
                },
                "Crimson Ink": {
                  "ItemID": "158188",
                  "Qty": "8"
                },
                "Ultramarine Ink": {
                  "ItemID": "158187",
                  "Qty": "15"
                }
              }
            }
          },
          "Recipe: Contract: Tortollan Seekers (Rank 2)": {
            "ItemID": "162371",
            "ReputationLevel": "Honored",
            "Cost": [
              1100,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Contract: Tortollan Seekers",
              "Rank": "2",
              "SpellID": "256295",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "1"
                },
                "Crimson Ink": {
                  "ItemID": "158188",
                  "Qty": "8"
                },
                "Ultramarine Ink": {
                  "ItemID": "158187",
                  "Qty": "15"
                }
              }
            }
          },
          "Recipe: Codex of the Quiet Mind (Rank 3)": {
            "ItemID": "162358",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Codex of the Quiet Mind",
              "Rank": "3",
              "SpellID": "256234",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "75"
                },
                "Crimson Ink": {
                  "ItemID": "158188",
                  "Qty": "45"
                },
                "Viridescent Ink": {
                  "ItemID": "158189",
                  "Qty": "15"
                }
              }
            }
          },
          "Recipe: Darkmoon Card of War (Rank 3)": {
            "ItemID": "162377",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Darkmoon Card of War",
              "Rank": "3",
              "SpellID": "256246",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "1"
                },
                "Viridescent Ink": {
                  "ItemID": "158189",
                  "Qty": "8"
                },
                "Expulsom": {
                  "ItemID": "152668",
                  "Qty": "1"
                }
              }
            }
          },
          "Recipe: Inked Vessel of Robust Regeneration (Rank 3)": {
            "ItemID": "162355",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Inked Vessel of Robust Regeneration",
              "Rank": "3",
              "SpellID": "256252",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "50"
                },
                "Crimson Ink": {
                  "ItemID": "158188",
                  "Qty": "20"
                },
                "Viridescent Ink": {
                  "ItemID": "158189",
                  "Qty": "8"
                },
                "Expulsom": {
                  "ItemID": "152668",
                  "Qty": "1"
                }
              }
            }
          },
          "Recipe: Inscribed Vessel of Mysticism (Rank 3)": {
            "ItemID": "162352",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Inscribed Vessel of Mysticism",
              "Rank": "3",
              "SpellID": "256249",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "50"
                },
                "Crimson Ink": {
                  "ItemID": "158188",
                  "Qty": "20"
                },
                "Viridescent Ink": {
                  "ItemID": "158189",
                  "Qty": "8"
                },
                "Expulsom": {
                  "ItemID": "152668",
                  "Qty": "1"
                }
              }
            }
          },
          "Recipe: Tome of the Quiet Mind (Rank 3)": {
            "ItemID": "162376",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Tome of the Quiet Mind",
              "Rank": "3",
              "SpellID": "256237",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "25"
                },
                "Crimson Ink": {
                  "ItemID": "158188",
                  "Qty": "5"
                },
                "Ultramarine Ink": {
                  "ItemID": "158187",
                  "Qty": "10"
                }
              }
            }
          },
          "Technique: Glyph of the Dolphin": {
            "ItemID": "162023",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Glyph of the Dolphin",
              "Rank": "1",
              "SpellID": "276059",
              "Materials": {
                "Light Parchment": {
                  "ItemID": "39354",
                  "Qty": "1"
                },
                "Crimson Ink": {
                  "ItemID": "158188",
                  "Qty": "10"
                },
                "Ultramarine Ink": {
                  "ItemID": "158187",
                  "Qty": "30"
                }
              }
            }
          }
        },
        "Tailoring": {
          "Pattern: Embroidered Deep Sea Bag (Rank 2)": {
            "ItemID": "162026",
            "ReputationLevel": "Revered",
            "Cost": [
              1400,
              0,
              0
            ],
            "Teaches": {
              "Spell": "Embroidered Deep Sea Bag",
              "Rank": "2",
              "SpellID": "257129",
              "Materials": {
                "Embroidered Deap Sea Satin": {
                  "ItemID": "158378",
                  "Qty": "70"
                },
                "Expulsom": {
                  "ItemID": "152668",
                  "Qty": "7"
                },
                "Hydrocore": {
                  "ItemID": "162460",
                  "Qty": "2"
                }
              }
            }
          }
        }
      }
    }}}));
import "hardhat/types";

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    etherscan?: {
      apiKey?: {
        sepolia?: string;
      };
    };
    sourcify?: {
      enabled?: boolean;
    };
  }

  interface HardhatConfig {
    etherscan?: {
      apiKey?: {
        sepolia?: string;
      };
    };
    sourcify?: {
      enabled?: boolean;
    };
  }
}

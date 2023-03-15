import { task } from "hardhat/config";
import buildAddressList from "../helpers/buildAddressList";

task("build-address-list", "build the address lists for deployments")
    .setAction(async (_, hre) => {
        buildAddressList()
    })
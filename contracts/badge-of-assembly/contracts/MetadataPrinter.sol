// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BadgeOfAssembly.sol";
import "./interfaces/IMetadataPrinter.sol";
import "solidity-json-writer/contracts/JsonWriter.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MetadataPrinter is IMetadataPrinter {
    using JsonWriter for JsonWriter.Json;

    function metadata(uint256 tokenID) public view override returns (string memory) {
        BadgeOfAssembly badger = BadgeOfAssembly(msg.sender);
        JsonWriter.Json memory writer;
        (string memory name, string memory description, string memory image, string memory animationUrl, string memory youtubeUrl,) = badger.metadata(tokenID);

        writer = writer.writeStartObject();
        writer = writer.writeStringProperty("name", name);
        writer = writer.writeStringProperty("description", description);
        writer = writer.writeStringProperty("image", image);
        writer = writer.writeStringProperty("animation_url", animationUrl);
        writer = writer.writeStringProperty("youtube_url", youtubeUrl);
        writer = writer.writeEndObject();

        return
            string.concat("data:application/json;base64,", Base64.encode(bytes(writer.value)));
    }
}

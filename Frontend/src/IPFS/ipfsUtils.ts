import axios from "axios";
import { Metadata } from "../types";

export async function addToIpfs(metaData: Metadata) {
	return await axios.post("https://us-central1-realpixestate-18a0e.cloudfunctions.net/uploadToIpfs", metaData);
}

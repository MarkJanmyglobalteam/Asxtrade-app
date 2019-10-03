export class User {
  uuid: string;
  address: string;
  email: string;
  firstname: string;
  lastname: string;
  photoUrl: string;
  isAdmin: boolean;
  birthdate: string;
  postCode: string;
  mobileNumber: string;
  oneSignalIds: string[];
  username: string;

  constructor(data) {
    this.uuid = data.uid || "";
    this.address = data.address || "";
    this.email = data.email || "";
    this.firstname = data.firstname || "";
    this.lastname = data.lastname || "";
    this.photoUrl = data.photoUrl || "";
    this.isAdmin = data.isAdmin ? true : false;
    this.birthdate = data.birthdate || "";
    this.postCode = data.postCode || "";
    this.mobileNumber = data.mobileNumber || "";
    this.username = data.username || `${this.firstname} ${this.lastname}`;
  }
}

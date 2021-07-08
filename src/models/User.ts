export default class User {
  ID: string;

  static async findByID(ID: number) : Promise<User> {
    return new User();
  }

}

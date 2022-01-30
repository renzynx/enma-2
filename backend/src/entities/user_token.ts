import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "user_token" })
export class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uid: string;

  @Column()
  access_token: string;

  @Column()
  refresh_token: string;
}

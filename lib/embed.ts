import { ApplicationCommandInteraction } from "harmony";

export function sentBy(d: ApplicationCommandInteraction) {
  return {
    footer: {
      icon_url: d.user.avatarURL(),
      text: "Sent by " + d.user.username,
    },
  };
}

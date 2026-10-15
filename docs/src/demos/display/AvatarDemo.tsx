// demo: Avatar with initials, a photo, a broken photo, and sizes
import { Avatar } from "@mds/ui";

const PHOTO =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#0f766e"/><circle cx="20" cy="16" r="7" fill="#99f6e4"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13z" fill="#99f6e4"/></svg>',
  );

// a photo that fails to load (an expired link) falls back to the initials
const BROKEN = "data:image/png;base64,AAAA";

export default function AvatarDemo() {
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <div className="mds-hstack" style={{ gap: 8 }}>
        <Avatar name="Ramesh Gupta" />
        <Avatar name="Priya Sinha" />
        <Avatar name="M/S Shree Balaji Traders" title="Partner since 2019" />
        <Avatar name="Anil" />
        <Avatar name="Kavita Kumari" src={PHOTO} />
        <Avatar name="Sunil Yadav" src={BROKEN} />
      </div>
      <div className="mds-hstack" style={{ gap: 8 }}>
        <Avatar name="Ramesh Gupta" size={20} />
        <Avatar name="Ramesh Gupta" size={28} />
        <Avatar name="Ramesh Gupta" size={40} />
        <Avatar name="Ramesh Gupta" size={56} />
      </div>
    </div>
  );
}

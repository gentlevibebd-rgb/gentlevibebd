import TrackClient from "./TrackClient";
import "./track.css";

export const metadata = {
  title: "Track Order — Gentle Vibe BD",
  description: "Track your order status live with Gentle Vibe BD using your Order ID or Phone number.",
};

export default function TrackPage() {
  return <TrackClient />;
}

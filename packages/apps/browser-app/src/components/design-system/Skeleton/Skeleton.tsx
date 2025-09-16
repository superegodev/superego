import ListSkeleton, {
  type Props as ListSkeletonProps,
} from "./ListSkeleton.js";

type Props = { variant: "list" } & ListSkeletonProps;
export default function Skeleton(props: Props) {
  switch (props.variant) {
    case "list":
      return <ListSkeleton {...props} />;
  }
}

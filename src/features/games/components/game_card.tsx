import { Card, Image, Text } from "@mantine/core";

type GameCardProps = {
  name: string;
  imageUrl: string | null;
  id: number | null;
};

export default function GameCard({ name, imageUrl, id }: GameCardProps) {
  return (
    <Card shadow="sm" padding="xl" component="a" href={`/games/${id}`}>
      <Card.Section>
        <Image src={imageUrl} h={160} w={100} alt={name} />
      </Card.Section>

      <Text fw={500} size="lg" mt="md">
        {name}
      </Text>
    </Card>
  );
}

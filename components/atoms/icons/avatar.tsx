type AvatarProps = {
  readonly firstName: string;
  readonly lastName: string;
};

export default function Avatar({ firstName, lastName }: AvatarProps) {
  return (
    <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 font-bold flex items-center justify-center">
      {firstName.charAt(0)}
      {lastName.charAt(0)}
    </div>
  );
}

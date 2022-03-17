
FROM denoland/deno:1.16.2

WORKDIR /app

USER deno

# These steps will be re-run upon each file change in your working directory:
ADD . .

# Stop crashing on railway errors
# CMD deno run --allow-read --allow-net --allow-env --import-map=imports.json mod.ts 
# CMD deno run --import-map=imports.json --allow-net --allow-env --allow-read --allow-write --allow-run --no-check index.ts --no-lava

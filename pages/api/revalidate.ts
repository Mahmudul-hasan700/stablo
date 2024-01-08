import type { NextApiRequest, NextApiResponse } from "next";
import { parseBody } from "next-sanity/webhook";
import { SanityDocument } from "@sanity/types";
export { config } from "next-sanity/webhook";

export default async function revalidate(
  req: NextApiRequest,
    res: NextApiResponse
    ) {
      try {
          const { body, isValidSignature } = await parseBody(
                req,
                      process.env.SANITY_REVALIDATE_SECRET
                          );
                              if (isValidSignature === false) {
                                    const message = "Invalid signature";
                                          console.log(message);
                                                return res.status(401).send(message);
                                                    }
                                                        const sanityBody = body as SanityDocument & {
                                                              slug: { current: string };
                                                                  };

                                                                      if (
                                                                            typeof sanityBody.slug.current !== "string" ||
                                                                                  !sanityBody.slug.current
                                                                                      ) {
                                                                                            const invalidSlug = "Invalid slug";
                                                                                                  console.error(invalidSlug, { sanityBody });
                                                                                                        return res.status(400).send(invalidSlug);
                                                                                                            }

                                                                                                                const staleRoutes = [`/post/${sanityBody.slug.current}`, "/"];
                                                                                                                    await Promise.all(
                                                                                                                          staleRoutes.map(route => res.revalidate(route))
                                                                                                                              );

                                                                                                                                  const updatedRoutes = `Updated routes: ${staleRoutes.join(", ")}`;
                                                                                                                                      console.log(updatedRoutes);
                                                                                                                                          return res.status(200).send(updatedRoutes);
                                                                                                                                            } catch (err) {
                                                                                                                                                console.error(err);
                                                                                                                                                    return res.status(500).send(err.message);
                                                                                                                                                      }
                                                                                                                                                      }
                                                                                                                                                      
